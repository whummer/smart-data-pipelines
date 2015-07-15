package io.riots.api.services.sim;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Parameter for simulations.
 * 
 * @author Waldemar Hummer
 */
public class SimulationParameter {

	@JsonProperty
	private String name;
	@JsonProperty
	private boolean required;

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public boolean isRequired() {
		return required;
	}
	public void setRequired(boolean required) {
		this.required = required;
	}
}
