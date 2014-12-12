package io.riots.core.model.sim;

import io.riots.core.model.BaseObjectCreated;
import io.riots.core.model.Device;
import io.riots.core.model.Property;
import io.riots.core.model.PropertyValue;
import io.riots.services.model.Constants;

import java.math.BigDecimal;
import java.math.RoundingMode;

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
public abstract class PropertySimulation<T> extends BaseObjectCreated<PropertySimulation<T>> {

	public static final String TYPE_RANDOM = "RANDOM";
	public static final String TYPE_ENUMERATED = "POINTS";
	public static final String TYPE_GPS_TRACE = "GPS";
	public static final String TYPE_FUNCTIONBASED = "FUNCTIONBASED";

	static double DEFAULT_INTERVAL_STEPS = 100;

	@JsonProperty
	@DBRef
	protected Property<?> property;
	// TODO remove
//	@JsonProperty
//	@DBRef
//	protected DeviceSimulation device;
	@JsonProperty
	@DBRef
	protected Device device;
	@JsonProperty
	public double startTime;
	@JsonProperty
	public double endTime;
	@JsonProperty
	protected double stepInterval;
	@JsonProperty
	protected String type;

	public TimelineValues<PropertyValue<T>> getValues(Time fromTime, Time toTime,
			Context ctx) {
		TimelineValues<PropertyValue<T>> result = new TimelineValues<>();
		double timeSpan = toTime.getTime() - fromTime.getTime();
		if(stepInterval <= 0) {
			stepInterval = timeSpan / DEFAULT_INTERVAL_STEPS;
		}
		for(double t = fromTime.getTime(); t < toTime.getTime(); t += stepInterval) {
			t = round(t);
			PropertyValue<T> val = getValueAt(new Time(t), ctx);
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
	public abstract PropertyValue<T> getValueAt(Time atTime, Context t);

	public double getStepInterval() {
		return stepInterval;
	}
	public void setStepInterval(double stepInterval) {
		this.stepInterval = stepInterval;
	}
	public Property<?> getProperty() {
		return property;
	}
	public void setProperty(Property<?> property) {
		this.property = property;
	}

}
