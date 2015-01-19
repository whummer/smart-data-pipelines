package io.riots.core.util.geo;

import io.riots.core.jms.EventBrokerComponent;
import io.riots.core.jms.EventBroker;
import io.riots.core.util.JSONUtil;
import io.riots.api.services.model.Location;
import io.riots.api.services.scenarios.PropertyValue;
import io.riots.api.services.triggers.GeoFence;
import io.riots.api.services.users.User;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

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
	private static final Logger LOG = Logger.getLogger(GeoPositionListener.class);

	final Map<String,GeoFence> geoFences = new ConcurrentHashMap<>();

	/**
	 * Maps thingId -> current (last seen) location
	 */
	final Map<String,Location> thingLocations = new ConcurrentHashMap<String,Location>();

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
		//System.out.println("GPS listener: " + data);

		synchronized (thingLocations) {
			if(!thingLocations.containsKey(prop.getThingId())) {
				thingLocations.put(prop.getThingId(), new Location());
			}
		}
		Location l = thingLocations.get(prop.getThingId());
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
		for(GeoFence gf : geoFences.values()) {
			boolean range = isWithinRange(l, gf);
			// fire event
			PropertyValue propValue = new PropertyValue();
			propValue.setPropertyName(PROPERTY_GEO_FENCE);
			propValue.setThingId(prop.getThingId());
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
//		// TODO currently circular, allow other fence patterns
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

}
