package io.riots.services.sim;

import io.riots.services.model.Location;
import io.riots.services.sim.TimelineValues.TimedValue;

/**
 * Represents a certain point, typically along a path, at a specific point in time.
 * @author hummer
 */
public class LocationInTime extends TimedValue<Location> {

	public LocationInTime() {
		this.property = new Location();
	}
	public LocationInTime(double lat, double lon, double time) {
		this.property = new Location(lat, lon);
		this.time = new Time(time);
	}

	public double getLatitude() {
		return property.getLatitude();
	}
	public double getLongitude() {
		return property.getLongitude();
	}
	public double getAltitude() {
		return property.getAltitude();
	}
	public double getTime() {
		return time.getTime();
	}
	public double getX() {
		return getLongitude();
	}
	public double getY() {
		return getLatitude();
	}
}
