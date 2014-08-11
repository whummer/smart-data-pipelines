package com.viotualize.core.domain;

/**
 * Represents a real-world location, encoded as latitude/longitude coordinates.
 *
 * @author Waldemar Hummer
 */
public class Location {

	double latitude;
	
	double longitude;

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
}
