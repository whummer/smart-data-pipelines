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
 * Represents a simulation template, i.e., an abstract and parameterizable 
 * simulation entity which represents a certain behavior pattern.
 * 
 * @author whummer
 */
public class SimulationType implements ObjectCreated, ObjectIdentifiable {

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
	 * List of simulation parameters.
	 */
	@JsonProperty
	private List<SimulationParameter> parameters = new LinkedList<>();

	/**
	 * The actual property simulation.
	 */
	@JsonProperty
	private PropertySimulation<?> simulation;

	public String getId() {
		return id;
	}
	public String getCreatorId() {
		return creatorId;
	}
	public void setCreatorId(String creatorId) {
		this.creatorId = creatorId;
	}
	public Date getCreated() {
		return created;
	}
	public void setCreated(Date created) {
		this.created = created;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public List<SimulationParameter> getParameters() {
		return parameters;
	}
	public PropertySimulation<?> getSimulation() {
		return simulation;
	}
	public void setSimulation(PropertySimulation<?> simulation) {
		this.simulation = simulation;
	}
}
