package io.riots.example;

import io.riots.api.services.DeviceTypes;
import io.riots.api.services.Devices;
import io.riots.api.services.Simulations;
import io.riots.core.model.Asset;
import io.riots.core.model.AssetType;
import io.riots.core.model.Device;
import io.riots.core.model.DeviceType;
import io.riots.core.model.Property;
import io.riots.core.model.ValueDomainDiscrete;

import java.util.List;

import org.junit.Before;
import org.junit.Test;

public class SmartLightingExample {

	String serviceURL = "http://localhost:8080/";
	List<Device> sensors;
	Devices devicesService;
	DeviceTypes deviceTypesService;
	Simulations simService;

	@Before
	@SuppressWarnings("rawtypes")
	public void setUp() {
		// TODO fix
		devicesService = new Devices(); 
		deviceTypesService = new DeviceTypes();
		simService = new Simulations();

		DeviceType lightSensor = new DeviceType("lightSensor1");
		Property<Double> lightProp = new Property.PropertyDouble("prop1");
		lightProp.getMetadata().setSensable(true);
		lightProp.setValueDomain(
				new ValueDomainDiscrete<Double>(-30.0, 50.0, 0.01));
		lightSensor.getDeviceProperties().add(lightProp);
		System.out.println(lightSensor);

		AssetType lampPost = new AssetType("name");
		System.out.println(lampPost);

		//sensors = devicesService.list(null, 1, 100000).getEntity();
	}

	@Test
	public void testScenario() {

		// TODO
		//SimulationScenario s = simService.

	}

	@SuppressWarnings("rawtypes")
	public static void main(String[] args) throws Exception {

		Asset switch1 = new Asset("Switch 1");
		DeviceType accType = new DeviceType("Sensor 2");
		
		// TODO

	}

}
