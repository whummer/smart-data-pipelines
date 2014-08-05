package com.viotualize.example;

import java.util.List;

import org.junit.Before;
import org.junit.Test;

import com.viotualize.api.services.DeviceTypes;
import com.viotualize.api.services.Devices;
import com.viotualize.core.domain.Asset;
import com.viotualize.core.domain.AssetType;
import com.viotualize.core.domain.Device;
import com.viotualize.core.domain.DeviceType;

public class SmartLightingExample {

	String serviceURL = "http://localhost:8080/";
	List<Device> sensors;
	Devices devicesService;
	DeviceTypes deviceTypesService;

	@Before
	@SuppressWarnings("rawtypes")
	public void setUp() {
		// TODO fix
		devicesService = new Devices(); 
		deviceTypesService = new DeviceTypes();

		DeviceType lightSensor = new DeviceType("lightSensor1");
		System.out.println(lightSensor);
		AssetType lampPost = new AssetType("name");
		System.out.println(lampPost);

		//sensors = devicesService.list(null, 1, 100000).getEntity();
	}

	@Test
	public void testScenario() {
		
	}

	@SuppressWarnings("rawtypes")
	public static void main(String[] args) {

		Asset switch1 = new Asset("Switch 1");
		DeviceType accType = new DeviceType("Sensor 2");
		
		// TODO

	}

}
