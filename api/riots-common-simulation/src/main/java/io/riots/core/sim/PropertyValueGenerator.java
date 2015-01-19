package io.riots.core.sim;

import io.riots.core.sim.jep.CustomOperators;
import io.riots.core.sim.jep.CustomOperators.OperatorType;
import io.riots.core.sim.traffic.TrafficSimulatorMatsim;
import io.riots.api.services.scenarios.PropertyValue;
import io.riots.api.services.sim.Context;
import io.riots.api.services.sim.PropertySimulation;
import io.riots.api.services.sim.PropertySimulationEnumerated;
import io.riots.api.services.sim.PropertySimulationFunctionBased;
import io.riots.api.services.sim.PropertySimulationGPS;
import io.riots.api.services.sim.PropertySimulationRandom;
import io.riots.api.services.sim.Time;
import io.riots.api.services.sim.TimelineValues;
import io.riots.api.services.sim.TimelineValues.TimedValue;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
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
		PropertyValue result = null;

		/* generate values if necessary */
		if(sim instanceof PropertySimulationGPS) {
			PropertySimulationGPS gps = (PropertySimulationGPS)sim;
			if(gps.getValues().isEmpty()) {
				TrafficSimulatorMatsim.generateTraces(gps);
			}
		}

		/* get value */
		if(sim instanceof PropertySimulationEnumerated) {
			// TODO make more efficient enumeration, store iterator state or similar.
			PropertySimulationEnumerated<?> e = (PropertySimulationEnumerated<?>)sim;
			List<TimedValue<PropertyValue>> values = e.getValues();
			for(int i = 0; i < values.size(); i ++) {
				TimedValue<PropertyValue> v = values.get(i);
				double t1 = v.time.getTime();
				double t2 = atTime.getTime();
				if(t1 == t2 || i >= values.size() - 1 || 
						t1 < t2 && t2 < values.get(i + 1).time.getTime()) {
					result = v.property;
					break;
				}
			}
		} else if(sim instanceof PropertySimulationRandom) {
			PropertySimulationRandom r = (PropertySimulationRandom)sim;
			double val = r.getMinValue() + (rand.nextDouble() * (r.getMaxValue() - r.getMinValue()));
			result = new PropertyValue(val);
		} else if(sim instanceof PropertySimulationFunctionBased) {
			PropertySimulationFunctionBased f = (PropertySimulationFunctionBased)sim;
			JEP parser = getParser();
			double t = atTime.getTime();
			parser.addVariable("x", t);
			parser.parseExpression(f.getFunction());
			double val = parser.getValue();
			result = new PropertyValue(val);
		} else {
			throw new IllegalArgumentException("Unknown simulation type: " + sim);
		}
		if(result == null)
			return result;
		if(result.getPropertyName() == null) {
			result.setPropertyName(sim.getPropertyName());
		}
		if(result.getThingId() == null) {
			result.setThingId(sim.getThingId());
		}
		return result;
	}

	public static TimelineValues<PropertyValue> getValues(
			PropertySimulation<?> sim, Context ctx) {
		return getValues(sim, new Time(sim.startTime), 
				new Time(sim.endTime), ctx);
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
			parser.addFunction("max", new CustomOperators(OperatorType.MAX));
			parser.addFunction("min", new CustomOperators(OperatorType.MIN));
		}
		return parser;
	}

}
