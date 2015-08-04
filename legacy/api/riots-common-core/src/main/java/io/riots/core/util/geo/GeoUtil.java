package io.riots.core.util.geo;

import io.riots.api.services.model.Location;

public class GeoUtil {

	public static double convertMetersToDegrees(double dist) {
		double equator = 40075 * 1000;
		return dist / equator * 360.0;
	}

	public static double distanceInMeters(Location p1, Location p2) {
		double lat1 = p1.getLatitude();
		double lat2 = p2.getLatitude();
		double lon1 = p1.getLongitude();
		double lon2 = p2.getLongitude();
		double R = 6371 * 1000;
		double dLat = Math.toRadians(lat2-lat1);
		double dLon = Math.toRadians(lon2-lon1); 
		double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		        Math.cos(Math.toRadians(lat1)) * 
		        Math.cos(Math.toRadians(lat2)) * 
		        Math.sin(dLon/2) * Math.sin(dLon/2);
		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		double d = R * c;
		return d;
	}

}
