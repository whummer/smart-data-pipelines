package io.riots.api.services.sim;

import io.riots.api.services.model.Location;
import io.riots.api.services.scenarios.TimedValue;

/**
 * Represents a certain location, typically along a path, at a specific point in time.
 * @author hummer
 */
public class LocationInTime extends TimedValue<Location> {

	public LocationInTime() {
		this.property = new Location();
		this.time = new Time(Double.NaN);
	}
	public LocationInTime(double lat, double lon, double time) {
		this.property = new Location(lat, lon);
		this.time = new Time(time);
	}
	public LocationInTime(LocationInTime loc) {
		this(loc.getLatitude(), loc.getLongitude(), loc.getTime());
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
	public void setLatitude(double value) {
		property.setLatitude(value);
	}
	public void setLongitude(double value) {
		property.setLongitude(value);
	}
	public Location getLocation() {
		return property;
	}
}
