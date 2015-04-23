package io.riox.analytics;

public class CircularGeofence implements Geofence {

	private double latitude;
	private double longitude;
	private float radius;

	public CircularGeofence(double latitude, double longitude, float radius) {
		this.latitude = latitude;
		this.longitude = longitude;
		this.radius = radius;
	
		validateRadius(radius);
		validateLatLong(latitude, longitude);
	}

	private void validateLatLong(double latitude, double longitude) {
		if (latitude > 90.0 || latitude < -90.0) {
			throw new IllegalArgumentException("Invalid latitude: " + latitude);
		}
		if (longitude > 180.0 || longitude < -180.0) {
			throw new IllegalArgumentException("Invalid longitude: "
					+ longitude);
		}
	}

	private void validateRadius(float radius2) {
		if (radius <= 0) {
			throw new IllegalArgumentException("Invalid radius: " + radius);
		}
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

	public float getRadius() {
		return radius;
	}

	public void setRadius(float radius) {
		this.radius = radius;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see io.riox.analytics.Geofence#match(double, double)
	 */
	@Override
	public boolean match(double latitude, double longitude) {

		double latDistance = Math.toRadians(getLatitude() - latitude);
		double lngDistance = Math.toRadians(getLongitude() - longitude);

		double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
				+ Math.cos(Math.toRadians(latitude))
				* Math.cos(Math.toRadians(getLatitude()))
				* Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	
		return (getRadius() - EARTH_RADIUS * c * 1000) > 0;
	}

	private final static double EARTH_RADIUS = 6371;

}
