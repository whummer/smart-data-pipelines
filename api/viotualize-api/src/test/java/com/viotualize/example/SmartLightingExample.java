package com.viotualize.example;

import java.util.List;

import org.junit.Before;
import org.junit.Test;

import com.viotualize.api.services.DeviceTypes;
import com.viotualize.api.services.Devices;
import com.viotualize.api.services.Simulations;
import com.viotualize.core.domain.Asset;
import com.viotualize.core.domain.AssetType;
import com.viotualize.core.domain.Device;
import com.viotualize.core.domain.DeviceType;
import com.viotualize.core.domain.Property;
import com.viotualize.core.domain.ValueDomain;

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
				new ValueDomain.DiscreteVD<Double>(-30.0, 50.0, 0.01));
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

		com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
		System.out.println(mapper.readValue(
				"{\"name\":\"unnamed\",\"baseType\":\"STRING\""
				//+ ",\"_class\":\"com.viotualize.core.domain.Property.PropertyString\""
				+ "}",
				Property.class));

		Asset switch1 = new Asset("Switch 1");
		DeviceType accType = new DeviceType("Sensor 2");
		
		// TODO

	}

}
