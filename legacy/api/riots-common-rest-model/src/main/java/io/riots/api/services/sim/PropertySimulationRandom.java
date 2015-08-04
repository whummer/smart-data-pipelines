package io.riots.api.services.sim;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Random value simulation.
 * 
 * @author Waldemar Hummer
 */
public class PropertySimulationRandom extends PropertySimulation<Double> {

	{
		type = PropertySimulation.TYPE_RANDOM;
	}

	@JsonProperty
	double minValue;
	@JsonProperty
	double maxValue;

	public double getMinValue() {
		return minValue;
	}

	public void setMinValue(double minValue) {
		this.minValue = minValue;
	}

	public double getMaxValue() {
		return maxValue;
	}

	public void setMaxValue(double maxValue) {
		this.maxValue = maxValue;
	}

	@Override
	public String toString() {
		return "PropertySimulationRandom [minValue=" + minValue + ", maxValue="
				+ maxValue + ", startTime=" + startTime + ", endTime="
				+ endTime + ", stepInterval=" + stepInterval + "]";
	}

}
