package io.riox.analytics;

import org.springframework.xd.tuple.Tuple;

public interface Geofence {

	boolean match(double latitude, double longitude);

	Tuple toTuple();
}