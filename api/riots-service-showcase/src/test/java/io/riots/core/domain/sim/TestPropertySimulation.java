package io.riots.core.domain.sim;

import io.riots.core.model.sim.Context;
import io.riots.core.model.sim.PropertySimulationFunctionBased;
import io.riots.core.model.sim.Time;
import io.riots.core.model.sim.TimelineValues;
import io.riots.services.scenario.PropertyValue;

import org.junit.Test;

public class TestPropertySimulation {

	@Test
	public void testGenerateValues() {
		PropertySimulationFunctionBased f = new PropertySimulationFunctionBased(
				"sin(x)", 0.1);
		Context ctx = new Context();

		TimelineValues<PropertyValue<Double>> vals = 
				f.getValues(new Time(0), new Time(10), ctx);

		System.out.println(vals);
		System.out.println(vals.getValues().size());
	}

}
