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
 * Represents a simulation template, i.e., an abstract and parameterizable 
 * simulation entity which represents a certain behavior pattern.
 * 
 * @author whummer
 */
public class SimulationType implements ObjectCreated, ObjectIdentifiable {

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
