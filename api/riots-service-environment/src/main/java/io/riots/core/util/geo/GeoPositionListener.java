package io.riots.core.util.geo;

import io.riots.api.services.jms.EventBroker;
import io.riots.api.util.JSONUtil;
import io.riots.services.model.Location;
import io.riots.services.scenario.PropertyValue;
import io.riots.services.users.User;
import io.riots.services.utils.GeoFence;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class GeoPositionListener {

	private static final String PROPERTY_GEO_FENCE = "riots.geo.fence";

	final Map<String,GeoFence> geoFences = new ConcurrentHashMap<>();

	/**
	 * Maps thingId -> current (last seen) location
	 */
	final Map<String,Location> thingLocations = new ConcurrentHashMap<String,Location>();

	@Autowired
    JmsTemplate template;

	@JmsListener(destination = EventBroker.MQ_PROP_CHANGE_NOTIFY)
	public void processEvent(String data) {
		PropertyValue prop = JSONUtil.fromJSON(data, PropertyValue.class);

		// TODO: how to identify GPS properties "semantically"
		boolean isLat = prop.getPropertyName().endsWith("latitude");
		boolean isLng = prop.getPropertyName().endsWith("longitude");

		if(!isLat && !isLng) {
			return;
		}

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
		for(GeoFence gf : geoFences.values()) {
			boolean range = isWithinRange(l, gf);
			// fire event
			PropertyValue propValue = new PropertyValue();
			propValue.setPropertyName(PROPERTY_GEO_FENCE);
			propValue.setThingId(prop.getThingId());
			Map<String,String> value = new HashMap<String, String>();
			value.put(gf.getId(), "" + range);
			propValue.setValue(value);
			EventBroker.sendChangeNotifyMessage(template, propValue);
		}
	}

	private boolean isWithinRange(Location l, GeoFence gf) {
		return isWithinRange(l, gf.getCenter(), gf.getDiameter());
	}
	private boolean isWithinRange(Location l, Location center, double rangeInMeters) {
		double range = convertMetersToDegrees(rangeInMeters);
		// TODO currently rectangular, make "circular"?
		return Math.abs(l.getLatitude() - center.getLatitude()) <= range && 
				Math.abs(l.getLongitude() - center.getLongitude()) <= range;
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

	public double convertMetersToDegrees(double dist) {
		double equator = 40075 * 1000;
		return dist / equator * 360.0;
	}

	public double distanceInMeters(Location p1, Location p2) {
		double lat1 = p1.getLatitude();
		double lat2 = p2.getLatitude();
		double lon1 = p1.getLongitude();
		double lon2 = p2.getLongitude();
		double R = 6371 * 1000;
		double dLat = Math.toRadians(lat2-lat1);
		double dLon = Math.toRadians(lon2-lon1); 
		double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		        Math.cos(Math.toRadians(lat1)) * 
		        Math.cos(Math.toRadians(lat2)) * 
		        Math.sin(dLon/2) * Math.sin(dLon/2);
		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		double d = R * c;
		return d;
	}

}