package io.riots.core.model.sim;

import io.riots.services.model.Constants;
import io.riots.services.model.interfaces.ObjectCreated;
import io.riots.services.model.interfaces.ObjectIdentifiable;
import io.riots.services.scenario.Thing;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Encapsulates all relevant data for a simulation scenario.
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_SIMULATIONS)
public class Simulation implements ObjectCreated, ObjectIdentifiable {

	@Id
	private String id;
	/**
	 * Creator
	 */
	private String creatorId;
	/**
	 * Creation date.
	 */
	private Date created;
	/**
	 * Specifications of devices used in this simulation.
	 */
	@DBRef
	private List<Thing> things = new LinkedList<>();
	/**
	 * Simulated properties of the device specifications.
	 */
	@DBRef
	private List<PropertySimulation<?>> simulationProperties = new LinkedList<>();
	/**
	 * Property constraints for this simulation.
	 */
	private List<SimulationConstraint> constraints = new LinkedList<>();

	public String getCreatorId() {
		return creatorId;
	}
	public Date getCreated() {
		return created;
	}
	public String getId() {
		return id;
	}
	public List<SimulationConstraint> getConstraints() {
		return constraints;
	}
	public void setConstraints(List<SimulationConstraint> constraints) {
		this.constraints = constraints;
	}
	public List<PropertySimulation<?>> getSimulationProperties() {
		return simulationProperties;
	}
	public void setSimulationProperties(
			List<PropertySimulation<?>> simulationProperties) {
		this.simulationProperties = simulationProperties;
	}
	public List<Thing> getThings() {
		return things;
	}

	@Override
	public String toString() {
		return "Simulation [simulationProperties="
				+ simulationProperties + ", constraints=" + constraints + "]";
	}

	public String generateSimulationCode() {
		StringBuilder b = new StringBuilder();
		// TODO
		return b.toString();
	}
}
