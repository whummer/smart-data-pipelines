package io.riots.api.services.triggers;

import io.riots.api.services.model.Constants;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Trigger expressed as a function over 
 * historical thing property values.
 * @author whummer
 */
public class ThingPropsFunction extends Trigger {
	{
		type = TriggerType.FUNCTION;
	}

	/**
	 * Thing to apply this trigger function to.
	 */
	@JsonProperty(Constants.THING_ID)
	private String thingId;
	/**
	 * Thing property to apply this trigger function to.
	 */
	@JsonProperty(Constants.PROPERTY_NAME)
	private String propertyName;
	/**
	 * Thing property to store the result to.
	 */
	@JsonProperty("resultProperty")
	private String resultPropertyName;
	/**
	 * Window size, i.e., number of historical 
	 * values to consider in the function processing.
	 */
	@JsonProperty
	private long windowSize = 100;
	/**
	 * Function which defined this trigger.
	 */
	@JsonProperty
	private String triggerFunction;
	/**
	 * Configuration object.
	 */
	@JsonProperty
	private Object config;


	public String getThingId() {
		return thingId;
	}
	public String getTriggerFunction() {
		return triggerFunction;
	}
	public String getPropertyName() {
		return propertyName;
	}
	public String getResultPropertyName() {
		return resultPropertyName;
	}
	public void setResultPropertyName(String resultPropertyName) {
		this.resultPropertyName = resultPropertyName;
	}
	public long getWindowSize() {
		return windowSize;
	}
	public Object getConfig() {
		return config;
	}
	public void setConfig(Object config) {
		this.config = config;
	}

	@Override
	public String toString() {
		return this.getClass().getSimpleName() + "[id=" + id + 
				", created=" + created + ", creatorId=" + creatorId + "]";
	}

}