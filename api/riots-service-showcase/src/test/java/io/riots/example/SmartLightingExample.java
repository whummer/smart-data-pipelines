package io.riots.example;

import io.riots.core.service.CatalogService;
import io.riots.core.service.ThingsService;
import io.riots.services.scenario.Thing;

import java.util.List;

public class SmartLightingExample {

	String serviceURL = "http://localhost:8080/";
	List<Thing> sensors;
	ThingsService thingsService;
	CatalogService catalogService;
//	Simulations simService;

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
