package io.riots.core.sim;

import io.riots.core.services.sim.Context;
import io.riots.core.services.sim.PropertySimulation;
import io.riots.core.services.sim.PropertySimulationEnumerated;
import io.riots.core.services.sim.PropertySimulationFunctionBased;
import io.riots.core.services.sim.PropertySimulationRandom;
import io.riots.core.services.sim.Time;
import io.riots.core.services.sim.TimelineValues;
import io.riots.core.services.sim.TimelineValues.TimedValue;
import io.riots.services.scenario.PropertyValue;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Random;

import org.nfunk.jep.JEP;

/**
 * Generate values corresponding to simulation specifications.
 * @author whummer
 */
public class PropertyValueGenerator {

	static final Random rand = new Random();

	static double DEFAULT_INTERVAL_STEPS = 100;


	public static PropertyValue getValueAt(
			PropertySimulation<?> sim, Time atTime, Context ctx) {
		if(sim instanceof PropertySimulationEnumerated) {
			PropertySimulationEnumerated<?> e = (PropertySimulationEnumerated<?>)sim;
			for(TimedValue<PropertyValue> v : (e).getValues()) {
				if(v.time.getTime() == atTime.getTime()) {
					return v.property;
				}
			}
		} else if(sim instanceof PropertySimulationRandom) {
			PropertySimulationRandom r = (PropertySimulationRandom)sim;
			double val = r.getMinValue() + (rand.nextDouble() * (r.getMaxValue() - r.getMinValue()));
			return new PropertyValue(val);
		} else if(sim instanceof PropertySimulationFunctionBased) {
			PropertySimulationFunctionBased f = (PropertySimulationFunctionBased)sim;
			JEP parser = getParser();
			double t = atTime.getTime();
			parser.addVariable("x", t);
			parser.parseExpression(f.getFunction());
			double val = parser.getValue();
			return new PropertyValue(val);
		} else {
			throw new IllegalArgumentException("Unknown simulation type: " + sim);
		}
		return null;
	}

	public static TimelineValues<PropertyValue> getValues(
			PropertySimulation<?> sim,
			Time fromTime, Time toTime, Context ctx) {

		/* if: we can enumerate the values */
		if(sim instanceof PropertySimulationEnumerated) {
			PropertySimulationEnumerated<?> s = (PropertySimulationEnumerated<?>)sim;
			return new TimelineValues<PropertyValue>(s.getValues());
		}

		/* else: we need to generate the values in a loop */
		TimelineValues<PropertyValue> result = new TimelineValues<>();
		double timeSpan = toTime.getTime() - fromTime.getTime();
		if(sim.getStepInterval() <= 0) {
			sim.setStepInterval(timeSpan / DEFAULT_INTERVAL_STEPS);
		}
		for(double t = fromTime.getTime(); t < toTime.getTime(); t += sim.getStepInterval()) {
			t = round(t);
			PropertyValue val = getValueAt(sim, new Time(t), ctx);
			result.getValues().add(
					new TimelineValues.TimedValue<>(
					new Time(t), val));
		}
		return result;
	}

	/* HELPER METHODS */

	private static double round(double value) {
		BigDecimal bd = new BigDecimal(value);
	    bd = bd.setScale(10, RoundingMode.HALF_UP);
	    return bd.doubleValue();
	}

	private static JEP getParser() {
		JEP parser = null;
		if (parser == null) {
			parser = new JEP();
			parser.addStandardConstants();
			parser.addStandardFunctions();
		}
		return parser;
	}

}
