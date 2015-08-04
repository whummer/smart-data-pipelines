package io.riots.api.services.sim;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Represents the simulation of a value's properties.
 * 
 * @author Waldemar Hummer
 */
@JsonSubTypes({
	@Type(value = PropertySimulationRandom.class, name=PropertySimulation.TYPE_RANDOM),
	@Type(value = PropertySimulationEnumerated.class, name=PropertySimulation.TYPE_ENUMERATED),
	@Type(value = PropertySimulationFunctionBased.class, name=PropertySimulation.TYPE_FUNCTIONBASED),
	@Type(value = PropertySimulationGPS.class, name=PropertySimulation.TYPE_GPS_TRACE)
})
@JsonTypeInfo(
		use = JsonTypeInfo.Id.NAME,
		include = JsonTypeInfo.As.PROPERTY,
		property = "type"
)
public abstract class PropertySimulation<T> {

	public static final String TYPE_RANDOM = "RANDOM";
	public static final String TYPE_ENUMERATED = "POINTS";
	public static final String TYPE_GPS_TRACE = "GPS";
	public static final String TYPE_FUNCTIONBASED = "FUNCTIONBASED";
	public static final String TYPE_DERIVED = "DERIVED";

	/**
	 * ID of the thing this simulation applies to.
	 */
	@JsonProperty("thing-id")
	protected String thingId;
	/**
	 * Name of the thing property this simulation applies to.
	 */
	@JsonProperty("property")
	protected String propertyName;
	/**
	 * Start time.
	 */
	@JsonProperty
	public double startTime;
	/**
	 * End time.
	 */
	@JsonProperty
	public double endTime;
	/**
	 * Step interval, in seconds (or fractions of seconds).
	 */
	@JsonProperty
	public double stepInterval;
	/**
	 * How often to repeat this simulation. 
	 * Value 0 means: don't repeat, only run once.
	 * Value -1 means: repeat indefinitely (until manually terminated).
	 */
	@JsonProperty
	public int repetitions;

	/**
	 * Simulation type. Determines concrete sub-classes.
	 */
	@JsonProperty
	protected String type;
	

	public void fillInParameters(List<SimulationParameterValue> parameters) {
		// TODO implement!!
	}
	
	/* GETTER/SETTER METHODS */

	public String getPropertyName() {
		return propertyName;
	}
	public void setPropertyName(String propertyName) {
		this.propertyName = propertyName;
	}
	public String getThingId() {
		return thingId;
	}
	public void setThingId(String thingId) {
		this.thingId = thingId;
	}
	public double getStepInterval() {
		return stepInterval;
	}
	public void setStepInterval(double stepInterval) {
		this.stepInterval = stepInterval;
	}
	public String getType() {
		return type;
	}
	public int getRepetitions() {
		return repetitions;
	}
	public void setRepetitions(int repetitions) {
		this.repetitions = repetitions;
	}

}
