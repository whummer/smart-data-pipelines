package io.riots.core.model.sim;

import io.riots.services.catalog.Property;
import io.riots.services.model.Constants;
import io.riots.services.scenario.PropertyValue;
import io.riots.services.scenario.Thing;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Represents the simulation of a value's properties.
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_SIM_PROPERTIES)
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

	static double DEFAULT_INTERVAL_STEPS = 100;

	@Id
	private String id;
	@JsonProperty
	@DBRef
	protected Property property;
	@JsonProperty
	@DBRef
	protected Thing thing;
	@JsonProperty
	public double startTime;
	@JsonProperty
	public double endTime;
	@JsonProperty
	protected double stepInterval;
	@JsonProperty
	protected String type;

	public TimelineValues<PropertyValue> getValues(Time fromTime, Time toTime,
			Context ctx) {
		TimelineValues<PropertyValue> result = new TimelineValues<>();
		double timeSpan = toTime.getTime() - fromTime.getTime();
		if(stepInterval <= 0) {
			stepInterval = timeSpan / DEFAULT_INTERVAL_STEPS;
		}
		for(double t = fromTime.getTime(); t < toTime.getTime(); t += stepInterval) {
			t = round(t);
			PropertyValue val = getValueAt(new Time(t), ctx);
			result.getValues().add(
					new TimelineValues.TimedValue<>(
					new Time(t), val));
		}
		return result;
	}

	protected double round(double value) {
		BigDecimal bd = new BigDecimal(value);
	    bd = bd.setScale(10, RoundingMode.HALF_UP);
	    return bd.doubleValue();
	}

	@JsonProperty
	public abstract PropertyValue getValueAt(Time atTime, Context t);

	public String getId() {
		return id;
	}
	public double getStepInterval() {
		return stepInterval;
	}
	public void setStepInterval(double stepInterval) {
		this.stepInterval = stepInterval;
	}

}
