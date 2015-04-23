package io.riox.analytics;

public class PolygonGeofence implements Geofence {

	private GeoCoordinates[] coordinates;

	public PolygonGeofence(GeoCoordinates[] coordinates) {
		this.coordinates = coordinates;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see io.riox.analytics.Geofence#match(double, double)
	 */
	@Override
	public boolean match(double latitude, double longitude) {
		
		return false;
	}

}
