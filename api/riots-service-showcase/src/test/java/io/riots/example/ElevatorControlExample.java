package io.riots.example;

import io.riots.api.services.DeviceTypes;
import io.riots.api.services.Devices;
import io.riots.api.services.Simulations;
import io.riots.core.model.Device;
import io.riots.core.sim.client.SimulationClient;
import io.riots.core.sim.client.SimulationClient.ResThingUpdate;
import io.riots.core.sim.client.SimulationClient.Thing;

import java.io.FileInputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.cxf.helpers.IOUtils;
import org.junit.Before;
import org.junit.Test;

public class ElevatorControlExample {

	String serviceURL = "http://localhost:8080/";
	List<Device> sensors;
	Devices devicesService;
	DeviceTypes deviceTypesService;
	Simulations simService;

	@Before
	public void setUp() {
	}

	static class Position {
		double lat, lng, alt;
	}

	private static class ElevatorController {

		Map<String,Thing> things = new HashMap<>();
		List<String> elevators = Arrays.asList("elevator_0", "elevator_1");
		//List<Integer> floors = Arrays.asList(0,1,2,3,4,5,6,7,8,9,10);
		int maxFloor = 6;
		int floorHeight = 5;
		Map<String,Integer> directions = new HashMap<>();

		@SuppressWarnings("unchecked")
		Map<String,Map<String,Object>> updateState(List<ResThingUpdate> updates) {
			Map<String,Map<String,Object>> result = new HashMap<>();

			List<Integer> waitingFloors = new LinkedList<>();
			for(ResThingUpdate up : updates) {
				//System.out.println("--> " + map.get("id").toString());
				things.put(up.thing.id, up.thing);
				/* get floors with waiting people */
				if(up.thing.id.startsWith("presence_sensor")) {
					//System.out.println(up.thing);
					if((Boolean)up.thing.properties.get("presence")) {
						Map<String,Object> position = (Map<String,Object>)up.thing.properties.get("position");
						int altitude = (int)position.get("alt");
						waitingFloors.add(altitude / floorHeight);
					}
				}
			}
			System.out.println("waiting floors: " + waitingFloors);

			/* update the state of the elevator(s) */
			for(String el : elevators) {
				Thing thing = things.get(el);
				result.put(el, new HashMap<>());
				if(thing != null) {
					Map<String,?> props = thing.properties;
					System.out.println(el + ": " + props);
					System.out.println(el + " door: " + props.get("door"));
					double dest = Double.parseDouble(props.get("destination_alt").toString());
					double alt = Double.parseDouble(((Map<String,?>)props.get("position")).get("alt").toString());
					if(!directions.containsKey(el))
						directions.put(el, 1);
					int direction = directions.get(el);
					direction = alt <= 0 ? 1 : alt >= (maxFloor * floorHeight) ? -1 : direction;
					directions.put(el, direction);
					System.out.println(dest + " - " + alt);
					if(dest == alt) {
						if("open".equals(props.get("door"))) {
							/* close door */
							//result.get(el).put("door", "closed");
							System.out.println("new position: " + (alt + direction * floorHeight));
							result.get(el).put("destination_alt", (alt + direction * floorHeight));
						} else {
							/* open door */
							//result.get(el).put("door", "open");
						}
					}
				}
			}

			return result;
		}
	}

	@Test
	public void testScenario() throws Exception {

//		Simulation s = new Simulation();
//		Device el1 = new Device("elevator_1");
//		DeviceType elType = new DeviceType("type_elevator");
//		s.getDevices().add(new DeviceSimulation.);
		//String code = s.generateSimulationCode(); // TODO

//		String code = IOUtils.toString(getClass().
//				getResourceAsStream("/elevatorControl.riot"));
		String code = IOUtils.toString(new FileInputStream(
				"src/main/webapp/examples/elevatorControl.riot"));

		ElevatorController control = new ElevatorController();

		//SimulationScenario s = simService.
		SimulationClient c = new SimulationClient("ws://localhost:9292/<id>");
		String simID = c.createSimulationRun(code);
		//c.waitUntilContinue();
		System.out.println("Enter key to continue...");
		System.in.read();

		for(int i = 0; i < 10000; i ++) {
			System.out.println("running next tick");
			List<ResThingUpdate> updates = c.runNextTick(simID);
			System.out.println("tick done.");
			Map<String,Map<String,Object>> elevatorUpdates = control.updateState(updates);
			List<ResThingUpdate> newUpdates = new LinkedList<>();
			for(String el : elevatorUpdates.keySet()) {
				Map<String,Object> floor = elevatorUpdates.get(el);
				ResThingUpdate update = new ResThingUpdate();
				update.thing.id = el;
				update.thing.properties.putAll(floor);
				newUpdates.add(update);
			}
			System.out.println("send updates.");
			c.sendUpdates(simID, newUpdates.toArray(new ResThingUpdate[0]));
			System.out.println("sent.");
			Thread.sleep(500);
		}
		//sess.sendMessage(new TextMessage("foo"));
	}

	public static void main(String[] args) throws Exception {
		ElevatorControlExample ex = new ElevatorControlExample();
		ex.testScenario();
	}

}
