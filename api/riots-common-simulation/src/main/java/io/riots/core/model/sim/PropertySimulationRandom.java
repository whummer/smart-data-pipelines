package io.riots.core.model.sim;

import io.riots.services.scenario.PropertyValue;

import java.util.Random;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
	@JsonIgnore
	Random rand = new Random();

	@Override
	public PropertyValue<Double> getValueAt(Time atTime, Context t) {
		double val = minValue + (rand.nextDouble() * (maxValue - minValue));
		//System.out.println("random value: [" + minValue  + "," + maxValue + "]: " + val);
		return new PropertyValue<>(val);
	}

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
				+ maxValue + ", property=" + property
				+ ", device=" + thing + ", startTime=" + startTime
				+ ", endTime=" + endTime + ", stepInterval=" + stepInterval + "]";
	}

}
