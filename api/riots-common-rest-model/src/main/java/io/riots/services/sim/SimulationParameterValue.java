package io.riots.services.sim;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Parameter value for simulations.
 * 
 * @author Waldemar Hummer
 */
public class SimulationParameterValue {

	@JsonProperty
	private String name;
	@JsonProperty
	private Object value;

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Object getValue() {
		return value;
	}
	public void setValue(Object value) {
		this.value = value;
	}
}
