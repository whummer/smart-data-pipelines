package io.riots.api.services.sim;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.riots.api.services.model.interfaces.ObjectCreated;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

/**
 * Encapsulates all relevant data for a simulation scenario.
 * 
 * @author Waldemar Hummer
 */
public class Simulation implements ObjectCreated, ObjectIdentifiable {

	/**
	 * Identifier.
	 */
	private String id;

	/**
	 * Creation date.
	 */
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creation-date")
	private Date created;

	/**
	 * Creator
	 */
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creator-id")
	private String creatorId;

	/**
	 * Name
	 */
	@JsonProperty
	private String name;

	/**
	 * Simulated properties. 
	 */
	@JsonProperty
	private List<PropertySimulation<?>> simulationProperties = 
		new LinkedList<PropertySimulation<?>>();

	public void setCreatorId(String creatorId) {
		this.creatorId = creatorId;
	}
	public String getCreatorId() {
		return creatorId;
	}
	public Date getCreated() {
		return created;
	}
	public void setCreated(Date created) {
		this.created = created;
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

	public String generateSimulationCode() {
		StringBuilder b = new StringBuilder();
		// TODO
		return b.toString();
	}
}
