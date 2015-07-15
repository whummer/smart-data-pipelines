package io.riox.analytics;

import org.springframework.xd.module.options.spi.ModuleOption;

/**
 * Holds options for the {@link GeofenceDetector} module
 *
 * @author riox
 */
public class GeofenceOptionsMetadata {

	private double latitude;
	private double longitude;
	private float radius;
	private String[] latPath;
	private String[] longPath;

	public double getLatitude() {
		return latitude;
	}

	@ModuleOption(value = "The latitude of the center of the geo-fence")
	public void setLatitude(double latitude) {
		this.latitude = latitude;
	}

	public double getLongitude() {
		return longitude;
	}

	@ModuleOption(value = "The longitude of the center of the geo-fence")
	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}

	public float getRadius() {
		return radius;
	}

	@ModuleOption(value = "The radius for the geo-fence in meters.")
	public void setRadius(float radius) {
		this.radius = radius;
	}

	public String[] getLatPath() {
		return latPath;
	}

	@ModuleOption(value = "The path (in dot notation) to extract the latitude value from the stream.")
	public void setLatPath(String[] latPath) {
		this.latPath = latPath;
	}

	public String[] getLongPath() {
		return longPath;
	}

	@ModuleOption(value = "The path (in dot notation) to extract the longitude value from the stream.")
	public void setLongPath(String[] longPath) {
		this.longPath = longPath;
	}


}