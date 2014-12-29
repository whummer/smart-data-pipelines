package io.riots.core.model.driver;

import io.riots.services.catalog.Property;
import io.riots.services.catalog.PropertyType;
import io.riots.services.drivers.SimulationDriverAndroid;
import io.riots.services.scenario.PropertyValue;

import java.util.Arrays;

import org.junit.Ignore;

public class TestAndroidDriver {

	@Ignore
	public void test() {
		SimulationDriverAndroid dr = new SimulationDriverAndroid();

		/* LOCATION */
		Property pLat = new Property("lat", PropertyType.LOCATION_LAT);
		Property pLon = new Property("lon", PropertyType.LOCATION_LON);
		Property pLoc = new Property("loc", PropertyType.LOCATION);
		PropertyValue vLat = new PropertyValue(pLon, 9.0);
		PropertyValue vLon = new PropertyValue(pLat, 10.0);
		PropertyValue vLoc = new PropertyValue(pLoc, Arrays.asList(vLat, vLon));

		dr.sendProperties(Arrays.asList(vLoc));

		/* BATTERY LEVEL */
 
		Property pPow = new Property();
		// TODO
		//pLoc.setSemanticType(new SemanticPropertyType(PredefinedPropTypes.battery_level.toString()));
		PropertyValue vPow = new PropertyValue(pPow, 85.0);
		dr.sendProperties(Arrays.asList(vPow));
		
	}

}
