package io.riots.services.sim;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Random value simulation.
 * 
 * @author Waldemar Hummer
 */
public class PropertySimulationFunctionBased extends PropertySimulation<Double> {

	{
		type = PropertySimulation.TYPE_FUNCTIONBASED;
	}

	@JsonProperty
	private String function;

	public PropertySimulationFunctionBased() {
	}

	public PropertySimulationFunctionBased(String function, double stepInterval) {
		this.function = function;
		this.stepInterval = stepInterval;
	}

	public String getFunction() {
		return function;
	}

	public void setFunction(String function) {
		this.function = function;
	}

	@Override
	public String toString() {
		return "PropertySimulationFunctionBased [function=" + function
				+ ", thingId=" + thingId + ", propertyName=" + propertyName
				+ ", startTime=" + startTime + ", endTime=" + endTime
				+ ", stepInterval=" + stepInterval + ", type=" + type + "]";
	}

}
