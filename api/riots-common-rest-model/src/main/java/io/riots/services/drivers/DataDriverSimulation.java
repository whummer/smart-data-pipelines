package io.riots.services.drivers;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;


/**
 * Represents a device driver for simulated properties.
 * 
 * @author Waldemar Hummer
 */
public class DataDriverSimulation extends DataDriver {

	{
		connector = DriverConnector.SIMULATION;
	}

	@JsonProperty("simulation-id")
	String simulationId;

	@JsonProperty
	List<Object> parameters;

	public String getSimulationId() {
		return simulationId;
	}
	public List<Object> getParameters() {
		return parameters;
	}
}
