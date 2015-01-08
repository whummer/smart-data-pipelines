package io.riots.services.sim;

import io.riots.services.model.interfaces.ObjectCreated;
import io.riots.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * Encapsulates all relevant data for a simulation scenario.
 * 
 * @author Waldemar Hummer
 */
public class Simulation implements ObjectCreated, ObjectIdentifiable {

	/**
	 * Identifier.
	 */
	@Id
	private String id;

	/**
	 * Creation date.
	 */
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creation-date")
	@Field(type = FieldType.Date)
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

	public void setCreatorId(String creatorId) {
		this.creatorId = creatorId;
	}
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
