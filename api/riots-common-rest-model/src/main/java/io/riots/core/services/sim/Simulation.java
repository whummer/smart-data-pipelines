package io.riots.core.services.sim;

import io.riots.services.model.interfaces.ObjectCreated;
import io.riots.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import org.springframework.data.annotation.Id;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Encapsulates all relevant data for a simulation scenario.
 * 
 * @author Waldemar Hummer
 */
//@Document(collection = Constants.COLL_SIMULATIONS)
public class Simulation implements ObjectCreated, ObjectIdentifiable {

	@Id
	private String id;
	/**
	 * Creator
	 */
	@JsonProperty
	private String creatorId;
	/**
	 * Creator
	 */
	@JsonProperty
	private String name;
	/**
	 * Creation date.
	 */
	@JsonProperty
	private Date created;
	/**
	 * Specifications of things used in this simulation.
	 */
	@JsonProperty
	private List<String> things = new LinkedList<>();
	/**
	 * Simulated properties of the device specifications. 
	 * List of {@link PropertySimulation} IDs.
	 */
	@JsonProperty
	private List<PropertySimulation<?>> simulationProperties = new LinkedList<PropertySimulation<?>>();

	public String getCreatorId() {
		return creatorId;
	}
	public Date getCreated() {
		return created;
	}
	public String getId() {
		return id;
	}
	public String getName() {
		return name;
	}
	public List<PropertySimulation<?>> getSimulationProperties() {
		return simulationProperties;
	}
	public void setSimulationProperties(
			List<PropertySimulation<?>> simulationProperties) {
		this.simulationProperties = simulationProperties;
	}
	public List<String> getThings() {
		return things;
	}

	@Override
	public String toString() {
		return "Simulation [simulationProperties=" + simulationProperties + "]";
	}

	public String generateSimulationCode() {
		StringBuilder b = new StringBuilder();
		// TODO
		return b.toString();
	}
}
