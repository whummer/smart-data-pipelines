package io.riox.analytics;

public interface Geofence {

	public abstract boolean match(double latitude, double longitude);

}