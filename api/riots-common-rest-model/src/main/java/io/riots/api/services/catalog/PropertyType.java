package io.riots.api.services.catalog;

/**
 * Represent different types of properties
 * @author whummer
 */
public enum PropertyType {
	STRING, 
	LONG, 
	DOUBLE, 
	BOOLEAN, 
	COMPLEX, 
	SET,
	LOCATION,
	LOCATION_LAT,
	LOCATION_LON,
	LOCATION_ALT;
}