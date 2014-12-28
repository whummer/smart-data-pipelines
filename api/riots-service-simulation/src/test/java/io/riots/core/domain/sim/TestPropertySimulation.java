package io.riots.core.domain.sim;

import io.riots.core.services.sim.Context;
import io.riots.core.services.sim.PropertySimulationFunctionBased;
import io.riots.core.services.sim.Time;
import io.riots.core.services.sim.TimelineValues;
import io.riots.core.sim.PropertyValueGenerator;
import io.riots.services.scenario.PropertyValue;

import org.junit.Test;

public class TestPropertySimulation {

	@Test
	public void testGenerateValues() {
		PropertySimulationFunctionBased f = new PropertySimulationFunctionBased(
				"sin(x)", 0.1);
		Context ctx = new Context();

		TimelineValues<PropertyValue> vals = PropertyValueGenerator.getValues(
				f, new Time(0), new Time(10), ctx);

		System.out.println(vals);
		System.out.println(vals.getValues().size());
	}

}
