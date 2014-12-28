package io.riots.core.sim;

import io.riots.core.services.sim.SimulationRun;
import io.riots.services.scenario.PropertyValue;

/**
 * Listener to process updates generated by a running simulation.
 * @author whummer
 */
public interface SimulationListener {

	void updateValue(SimulationRun sim, PropertyValue value);

}
