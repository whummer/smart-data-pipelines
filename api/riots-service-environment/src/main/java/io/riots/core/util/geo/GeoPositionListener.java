package io.riots.core.util.geo;

import io.riots.api.services.model.Location;
import io.riots.api.services.scenarios.PropertyValue;
import io.riots.api.services.sim.LocationInTime;
import io.riots.api.services.sim.Time;
import io.riots.api.services.triggers.GeoFence;
import io.riots.api.services.triggers.SpeedCalculator;
import io.riots.api.services.users.User;
import io.riots.core.jms.EventBroker;
import io.riots.core.jms.EventBrokerComponent;
import io.riots.core.util.JSONUtil;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class GeoPositionListener {

	private static final String PROPERTY_GEO_FENCE = "riots.geo.fence";
	private static final String PROPERTY_SPEED = "speed";
	private static final Logger LOG = Logger.getLogger(GeoPositionListener.class);

	final Map<String,GeoFence> geoFences = new ConcurrentHashMap<>();
	final Map<String,SpeedCalculator> speeds = new ConcurrentHashMap<>();

	/**
	 * Maps thingId -> current (last seen) location
	 */
	final Map<String,LocationInTime> thingLocations = new ConcurrentHashMap<String,LocationInTime>();

	@Autowired
    EventBrokerComponent eventBroker;

	@JmsListener(containerFactory = EventBroker.CONTAINER_FACTORY_NAME, 
			destination = EventBroker.MQ_OUTBOUND_PROP_CHANGE_NOTIFY)
	public void processEvent(String data) {
		PropertyValue prop = JSONUtil.fromJSON(data, PropertyValue.class);

		if(prop == null || prop.getPropertyName() == null) {
			LOG.warn("Received null property: " + prop);
			return;
		}

		// TODO: how to identify GPS properties "semantically"
		boolean isLat = prop.getPropertyName().endsWith("latitude");
		boolean isLng = prop.getPropertyName().endsWith("longitude");
		boolean isLoc = prop.getPropertyName().endsWith("location");

		if(!isLat && !isLng && !isLoc) {
			return;
		}

		LocationInTime oldLoc = null;
		synchronized (thingLocations) {
			if(!thingLocations.containsKey(prop.getThingId())) {
				thingLocations.put(prop.getThingId(), new LocationInTime());
			} else {
				oldLoc = new LocationInTime(thingLocations.get(prop.getThingId()));
			}
		}
		LocationInTime l = thingLocations.get(prop.getThingId());
		l.time = new Time(prop.getTimestamp());
		if(isLat) {
			l.setLatitude((Double)prop.getValue());
		}
		if(isLng) {
			l.setLongitude((Double)prop.getValue());
		}
		if(isLoc) {
			Map<?,?> value = (Map<?, ?>) prop.getValue();
			l.setLatitude((Double)value.get("latitude"));
			l.setLongitude((Double)value.get("longitude"));
		}

		/* process geo fences */
		processGeoFences(prop.getThingId(), l, oldLoc);
		/* process speed calculations */
		processSpeedCalcs(prop.getThingId(), l, oldLoc);
	}

	private void processSpeedCalcs(String thingId, 
			LocationInTime newLoc, LocationInTime oldLoc) {
		if(oldLoc == null)
			return;
		for(SpeedCalculator s : speeds.values()) {
			if(thingId.equals(s.getThingId())) {
				double dist = GeoUtil.distanceInMeters(
						newLoc.getLocation(), oldLoc.getLocation());
				double time = (newLoc.getTime() - oldLoc.getTime()) / 1000.0;
				double speed = dist / time;
				double minTimeDiffBetweenTwoLocations = 0.1;
				if(speed != Double.NaN && time >= minTimeDiffBetweenTwoLocations) {
					// fire event
					PropertyValue propValue = new PropertyValue();
					propValue.setPropertyName(PROPERTY_SPEED);
					propValue.setThingId(thingId);
					propValue.setValue(speed);
					propValue.setTimestamp(newLoc.getTime());
					eventBroker.sendOutboundChangeNotifyMessage(propValue);
				}
			}
		}
	}

	private void processGeoFences(String thingId, LocationInTime newLoc, LocationInTime oldLoc) {
		for(GeoFence gf : geoFences.values()) {
			boolean range = isWithinRange(newLoc.getLocation(), gf);
			// fire event
			PropertyValue propValue = new PropertyValue();
			propValue.setPropertyName(PROPERTY_GEO_FENCE);
			propValue.setThingId(thingId);
			Map<String,Object> value = new HashMap<String,Object>();
			value.put(gf.getId(), range);
			propValue.setValue(value);
			eventBroker.sendOutboundChangeNotifyMessage(propValue);
		}
	}

	private boolean isWithinRange(Location l, GeoFence gf) {
		return isWithinRange(l, gf.getCenter(), gf.getDiameter());
	}
	private boolean isWithinRange(Location l, Location center, double rangeInMeters) {
		// TODO currently only circular, allow other fence patterns
		double dist = GeoUtil.distanceInMeters(l, center);
		return dist <= rangeInMeters;
	}

	public GeoFence updateGeoFence(GeoFence f) {
		if(f.getId() == null)
			throw new IllegalArgumentException("ID cannot be null");
		geoFences.put(f.getId(), f);
		return f;
	}

	public GeoFence addGeoFence(GeoFence f) {
		if(f.getId() == null)
			f.setId(UUID.randomUUID().toString());
		geoFences.put(f.getId(), f);
		return f;
	}

	public void removeGeoFence(String id) {
		if(id == null) {
			throw new IllegalArgumentException("Illegal GeoFence ID: " + id);
		}
		geoFences.remove(id);
	}

	public List<GeoFence> getGeoFences(User user) {
		List<GeoFence> result = new LinkedList<>();
		for(GeoFence f : geoFences.values()) {
			if(user.getId().equals(f.getCreatorId())) {
				result.add(f);
			}
		}
		return result;
	}

	public SpeedCalculator addSpeedCalc(SpeedCalculator t) {
		if(StringUtils.isEmpty(t.getThingId()))
			throw new IllegalArgumentException("Thing ID must not be empty.");
		SpeedCalculator existing = speeds.get(t.getThingId());
		if(existing != null) {
			return existing;
		}
		if(t.getId() == null) {
			t.setId(UUID.randomUUID().toString());
		}
		speeds.put(t.getThingId(), t);
		return t;
	}

	public void removeSpeedCalc(String id) {
		if(id == null) {
			throw new IllegalArgumentException("Illegal ID: " + id);
		}
		speeds.remove(id);
	}

}
