package io.riots.services.sim;

import io.riots.services.model.Location;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Random value simulation.
 * 
 * @author Waldemar Hummer
 */
public class PropertySimulationGPS extends
		PropertySimulationEnumerated<Location> {

	{
		type = PropertySimulation.TYPE_GPS_TRACE;
	}

	/**
	 * Center of the trace area (latitude);
	 */
	@JsonProperty
	protected double latitude;
	/**
	 * Center of the trace area (longitude);
	 */
	@JsonProperty
	protected double longitude;
	/**
	 * Diameter of the trace area around the center (in km);
	 */
	@JsonProperty
	protected double diameter;
	/**
	 * Diameter of the trace area around the center (in km);
	 */
	@JsonProperty
	protected double maxSpeed;

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

	public double getDiameter() {
		return diameter;
	}
	public void setDiameter(double diameter) {
		this.diameter = diameter;
	}

	public double getMaxSpeed() {
		return maxSpeed;
	}
	public void setMaxSpeed(double maxSpeed) {
		this.maxSpeed = maxSpeed;
	}

	@Override
	public String toString() {
		return getClass().getSimpleName() + "[values=" + values
				+ ", startTime=" + startTime + ", endTime=" + endTime
				+ ", stepInterval=" + stepInterval + "]";
	}

}
