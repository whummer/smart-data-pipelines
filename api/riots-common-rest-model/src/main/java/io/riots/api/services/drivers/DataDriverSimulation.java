package io.riots.api.services.drivers;

import io.riots.api.services.sim.SimulationParameterValue;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;


/**
 * Represents a device driver for simulated properties.
 * 
 * @author Waldemar Hummer
 */
public class DataDriverSimulation extends DataDriver {

	{
		connector = DriverConnector.RIOTS_SIMULATION;
	}

	@JsonProperty("simulation-id")
	String simulationId;

	@JsonProperty
	List<SimulationParameterValue> parameters;

	public String getSimulationId() {
		return simulationId;
	}
	public List<SimulationParameterValue> getParameters() {
		return parameters;
	}
}
