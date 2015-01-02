package io.riots.core.util.geo;

import io.riots.api.services.jms.EventBroker;
import io.riots.api.util.JSONUtil;
import io.riots.services.UtilsService.GeoFence;
import io.riots.services.model.Location;
import io.riots.services.scenario.PropertyValue;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

/**
 * 
 * @author whummer
 */
@Component
public class GeoPositionListener {

	final Map<String,GeoFence> geoFences = new ConcurrentHashMap<>();

	/**
	 * Maps thingId -> current (last seen) location
	 */
	final Map<String,Location> thingLocations = new ConcurrentHashMap<String,Location>();

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
			if(isWithinRange(l, gf)) {
				// fire event
			}
		}
	}

	private boolean isWithinRange(Location l, GeoFence gf) {
		return isWithinRange(l, gf.getCenter(), gf.getDiameter());
	}
	private boolean isWithinRange(Location l, Location center, double range) {
		// TODO currently rectangular, make "circular"?
		return Math.abs(l.getLatitude() - center.getLatitude()) <= range && 
				Math.abs(l.getLongitude() - center.getLongitude()) <= range;
	}

	public void addGeoFence(GeoFence f) {
		if(f.getId() == null)
			f.setId(UUID.randomUUID().toString());
		geoFences.put(f.getId(), f);
	}

	public void removeGeoFence(String id) {
		if(id == null) {
			throw new IllegalArgumentException("Illegal GeoFence ID: " + id);
		}
		geoFences.remove(id);
	}
	
}
