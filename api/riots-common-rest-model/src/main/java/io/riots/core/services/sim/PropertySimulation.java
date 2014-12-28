package io.riots.core.services.sim;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Represents the simulation of a value's properties.
 * 
 * @author Waldemar Hummer
 */
//@Document(collection = Constants.COLL_SIM_PROPERTIES)
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

	@JsonProperty
	private String name;
	@JsonProperty("property")
	protected String propertyName;
	@JsonProperty("thing-id")
	protected String thingId;
	@JsonProperty
	public double startTime;
	@JsonProperty
	public double endTime;
	@JsonProperty
	protected double stepInterval;
	@JsonProperty
	protected String type;

	public String getName() {
		return name;
	}
//	public String getId() {
//		return id;
//	}
	public double getStepInterval() {
		return stepInterval;
	}
	public void setStepInterval(double stepInterval) {
		this.stepInterval = stepInterval;
	}

}
