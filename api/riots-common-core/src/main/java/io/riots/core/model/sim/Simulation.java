package io.riots.core.model.sim;

import io.riots.core.model.BaseObjectCreated;
import io.riots.core.model.Device;
import io.riots.core.model.sim.DeviceSimulation.DeviceSimulationGroup;
import io.riots.core.model.sim.DeviceSimulation.DeviceSimulationInstance;
import io.riots.services.model.Constants;

import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Encapsulates all relevant data for a simulation scenario.
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_SIMULATIONS)
public class Simulation extends BaseObjectCreated<Simulation> {

	/**
	 * Specifications of devices used in this simulation.
	 */
	@DBRef
	private List<DeviceSimulation> devices = new LinkedList<>();
	/**
	 * Simulated properties of the device specifications.
	 */
	@DBRef
	private List<PropertySimulation<?>> simulationProperties = new LinkedList<>();
	/**
	 * Property constraints for this simulation.
	 */
	private List<SimulationConstraint> constraints = new LinkedList<>();

	/**
	 * Resolve all {@link DeviceSimulation} references of this simulation and 
	 * return the total list of all devices in this simulation.
	 * @return
	 */
	@JsonIgnore
	public List<Device> getAllDevices() {
		List<Device> result = new LinkedList<Device>();
		for(DeviceSimulation s : devices) {
			if(s instanceof DeviceSimulationInstance) {
				result.add(((DeviceSimulationInstance)s).getInstance());
			} else if(s instanceof DeviceSimulationGroup) {
				// TODO implement
				throw new RuntimeException("not implemented");
			} else {
				throw new RuntimeException("Unknown device spec: " + s);
			}
		}
		return result;
	}

	/**
	 * Generate IDs of associated objects, where necessary.
	 */
	public void generateNecessaryIDs() {
		for(DeviceSimulation d : devices) {
			if(d.getId() == null || d.getId().trim().isEmpty()) {
				d.setId(UUID.randomUUID().toString());
			}
		}
	}

	public List<DeviceSimulation> getDevices() {
		return devices;
	}
	public void setDevices(List<DeviceSimulation> devices) {
		this.devices = devices;
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

	@Override
	public String toString() {
		return "Simulation [devices=" + devices + ", simulationProperties="
				+ simulationProperties + ", constraints=" + constraints + "]";
	}

	public String generateSimulationCode() {
		StringBuilder b = new StringBuilder();
		// TODO
		return b.toString();
	}
}
