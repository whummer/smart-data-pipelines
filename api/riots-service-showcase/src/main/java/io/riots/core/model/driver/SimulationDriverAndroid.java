package io.riots.core.model.driver;

import io.riots.services.scenario.PropertyValue;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.Socket;
import java.util.Arrays;
import java.util.List;

/**
 * Simulation driver for Android devices or an Android emulator.
 * @author Waldemar Hummer
 */
@SuppressWarnings("all")
public class SimulationDriverAndroid implements SimulationDriver {

	public void sendProperties(List<PropertyValue> props) {
		for(PropertyValue prop : props) {
			// TODO!
//			SemanticPropertyType type = prop.getProperty().getSemanticType();
//			if(type.isType(PredefinedPropTypes.location)) {
//				processLocation(prop);
//			} else if(type.isType(PredefinedPropTypes.battery_level)) {
//				processBattery(prop);
//			} else if(type.isType(PredefinedPropTypes.network_delay)) {
//				processNetworkDelay(prop);
//			}
		}
	}

	private void processBattery(PropertyValue prop) {
		sendDebuggerCommand("power capacity " + (Double)prop.getValue());
	}

	private void processNetworkDelay(PropertyValue prop) {
		String value = (String)prop.getValue();
		if(!Arrays.asList("gprs", "edge", "umts", "none").contains(value)) {
			throw new IllegalArgumentException("Unknown network cellular status: " + value);
		}
		sendDebuggerCommand("network delay " + value);
	}

	private void processLocation(PropertyValue prop) {
		double lat = 0;
		double lon = 0;
		@SuppressWarnings("unchecked")
		List<PropertyValue> subValues = (List<PropertyValue>)prop.getValue();
		for(PropertyValue s : subValues) {
			// TODO!!
//			SemanticPropertyType t = s.getProperty().getSemanticType();
//			if(t.isType(PredefinedPropTypes.location_lat)) {
//				lat = (Double)s.getValue();
//			} else if(t.isType(PredefinedPropTypes.location_lon)) {
//				lon = (Double)s.getValue();
//			}
		}
		sendDebuggerCommand("geo fix " + lon + " " + lat);
	}

	private String sendDebuggerCommand(String cmd) {
		try {
			Socket s = new Socket("localhost", 5554);
			String out = readLine(s);
			cmd += "\n";
			s.getOutputStream().write(cmd.getBytes());
			out = readLine(s);
			s.close();
			return out;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	private String readLine(Socket s) {
		try {
			BufferedReader r = new BufferedReader(
					new InputStreamReader(s.getInputStream()));
			String temp = r.readLine();
			return temp;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	String readLines(Socket s) {
		try {
			BufferedReader r = new BufferedReader(
					new InputStreamReader(s.getInputStream()));
			String temp = "";
			StringBuilder b = new StringBuilder();
			while((temp = r.readLine()) != null) {
				b.append(temp);
				b.append("\n");
			}
			return b.toString();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

}
