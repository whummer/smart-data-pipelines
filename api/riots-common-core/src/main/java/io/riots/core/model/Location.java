package io.riots.core.model;

/**
 * Represents a real-world location, encoded as 
 * latitude/longitude (and optionally altitude) coordinates.
 *
 * @author Waldemar Hummer
 */
public class Location {

	double latitude;

	double longitude;

	double altitude;

	public Location() {}
	public Location(double lat, double lon) {
		this.latitude = lat;
		this.longitude = lon;
	}

	public double getLatitude() {
		return latitude;
	}
	public void setLatitude(double latitude) {
		this.latitude = latitude;
	}
	public double getLongitude() {
		return longitude;
	}
	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}
	public double getAltitude() {
		return altitude;
	}
	public void setAltitude(double altitude) {
		this.altitude = altitude;
	}
}
