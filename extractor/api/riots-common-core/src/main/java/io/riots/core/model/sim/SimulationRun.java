package io.riots.core.model.sim;

import io.riots.core.model.BaseObjectCreated;
import io.riots.core.model.PropertyValue;
import io.riots.services.model.Constants;

import java.util.LinkedList;
import java.util.List;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Encapsulates the results of a single execution of a simulation.
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_SIMULATION_RUNS)
public class SimulationRun extends BaseObjectCreated<SimulationRun> {

	@JsonProperty
	private List<TimeTick> timeTicks = new LinkedList<SimulationRun.TimeTick>();
	@DBRef
	private Simulation simulation;

	public static class TimeTick {
		public long count;
		public double timestamp;
		public List<PropertyValue<?>> properties = new LinkedList<>();
	}

	public SimulationRun() {}
	public SimulationRun(Simulation simulation) {
		this.simulation = simulation;
	}

	public List<TimeTick> getTimeTicks() {
		return timeTicks;
	}
}
