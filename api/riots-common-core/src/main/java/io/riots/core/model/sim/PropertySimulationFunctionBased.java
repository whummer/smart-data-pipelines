package io.riots.core.model.sim;

import io.riots.core.model.PropertyValue;

import org.nfunk.jep.JEP;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Random value simulation.
 * 
 * @author Waldemar Hummer
 */
public class PropertySimulationFunctionBased extends PropertySimulation<Double> {

	{
		type = PropertySimulation.TYPE_FUNCTIONBASED;
	}

	@JsonProperty
	private String function;

	public PropertySimulationFunctionBased() {}
	public PropertySimulationFunctionBased(String function, double stepInterval) {
		this.function = function;
		this.stepInterval = stepInterval;
	}

	@Override
	public PropertyValue<Double> getValueAt(Time atTime, Context ctx) {
		JEP parser = getParser();
		double t = atTime.getTime();
		parser.addVariable("x", t);
		parser.parseExpression(function);
		double val = parser.getValue();
		//System.out.println("f(x)=" + function + "; f(" + t + ")=" + val);
		return new PropertyValue<>(val);
	}

	public String getFunction() {
		return function;
	}
	public void setFunction(String function) {
		this.function = function;
	}
	
	private JEP getParser() {
		JEP parser = null;
		if(parser == null) {
			parser = new JEP();
			parser.addStandardConstants();
			parser.addStandardFunctions();
		}
		return parser;
	}

	@Override
	public String toString() {
		return getClass().getSimpleName() + "[function=" + function
				+ ", stepInterval=" + stepInterval + ", type=" + type
				+ ", created=" + getCreated() + ", creator=" + getCreator() + ", id="
				+ getId() + ", name=" + getName() + ", description=" + getDescription()
				+ ", properties=" + getProperties() + "]";
	}
	
	
}
