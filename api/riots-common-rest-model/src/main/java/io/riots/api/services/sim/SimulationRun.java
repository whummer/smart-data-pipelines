package io.riots.api.services.sim;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;
import io.riots.api.services.scenarios.PropertyValue;

import java.util.LinkedList;
import java.util.List;

/**
 * Encapsulates the results of a single execution of a simulation.
 * 
 * @author Waldemar Hummer
 */
public class SimulationRun implements ObjectIdentifiable {

	private String id;

	@JsonProperty
	private List<TimeTick> timeTicks = new LinkedList<SimulationRun.TimeTick>();

    @JsonProperty
	private Simulation simulation;

	public static class TimeTick {
		public long count;
		public double timestamp;
		public List<PropertyValue> properties = new LinkedList<>();
	}

	public SimulationRun() {}
	public SimulationRun(Simulation simulation) {
		this.simulation = simulation;
	}

	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public List<TimeTick> getTimeTicks() {
		return timeTicks;
	}
	public Simulation getSimulation() {
		return simulation;
	}
}
