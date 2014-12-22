package io.riots.example;

import io.riots.api.services.Simulations;
import io.riots.core.service.ICatalogService;
import io.riots.core.service.IThings;
import io.riots.core.service.ServiceClientFactory;
import io.riots.services.catalog.Property;
import io.riots.services.catalog.ThingType;
import io.riots.services.catalog.ValueDomainDiscrete;
import io.riots.services.scenario.Thing;

import java.util.List;

import org.junit.Before;
import org.junit.Test;

public class SmartLightingExample {

	String serviceURL = "http://localhost:8080/";
	List<Thing> sensors;
	IThings thingsService;
	ICatalogService catalogService;
	Simulations simService;

/*	@Before
	@SuppressWarnings("rawtypes")
	public void setUp() {
		// TODO fix
		thingsService = ServiceClientFactory.getThingsServiceClient(); 
		catalogService = ServiceClientFactory.getCatalogServiceClient();
		simService = new Simulations();

		ThingType lightSensor = new ThingType("lightSensor1");
		Property lightProp = new Property("prop1");
		lightProp.setSensable(true);
		lightProp.setValueDomain(
				new ValueDomainDiscrete<Double>(-30.0, 50.0, 0.01));
		lightSensor.getProperties().add(lightProp);
		System.out.println(lightSensor);

		//sensors = ThingsService.list(null, 1, 100000).getEntity();
	}

	@Test
	public void testScenario() {

		// TODO
		//SimulationScenario s = simService.

	}

	public static void main(String[] args) throws Exception {

		Thing switch1 = new Thing("Switch 1");
		ThingType accType = new ThingType("Sensor 2");
		
		// TODO

	}*/

}
