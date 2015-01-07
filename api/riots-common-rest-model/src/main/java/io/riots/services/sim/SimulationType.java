package io.riots.services.sim;

import io.riots.services.model.interfaces.ObjectCreated;
import io.riots.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import org.springframework.data.annotation.Id;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents a simulation template, i.e., an abstract and parameterizable 
 * simulation entity which represents a certain behavior pattern.
 * 
 * @author whummer
 */
public class SimulationType implements ObjectCreated, ObjectIdentifiable {

	@Id
	private String id;
	/**
	 * Creator
	 */
	@JsonProperty
	private String creatorId;
	/**
	 * Creation date.
	 */
	@JsonProperty
	private Date created;
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
	public List<SimulationParameter> getParameters() {
		return parameters;
	}
}
