package io.riots.services.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * Represents a real-world location, encoded as latitude/longitude (and
 * optionally altitude) coordinates.
 *
 * @author Waldemar Hummer
 */
public class Location {

	@JsonInclude(Include.NON_EMPTY) 
	private double latitude;

	@JsonInclude(Include.NON_EMPTY) 
	private double longitude;

	@JsonInclude(Include.NON_EMPTY)
	private double altitude;

	public Location() {
	}

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
