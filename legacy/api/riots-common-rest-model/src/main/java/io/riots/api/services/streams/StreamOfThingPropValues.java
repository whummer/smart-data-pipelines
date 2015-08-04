package io.riots.api.services.streams;

import io.riots.api.services.model.Constants;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents a data stream consisting of thing property values.
 * 
 * @author whummer
 */
public class StreamOfThingPropValues extends Stream {
	{
		type = StreamType.THING_PROPERTY;
	}

	/**
	 * Name of the thing type whose properties are transmitted via this stream.
	 */
	@JsonProperty(Constants.THING_TYPE)
	String thingType;
	/**
	 * Name of the thing property transmitted via this stream.
	 */
	@JsonProperty(Constants.PROPERTY_NAME)
	String propertyName;

	public String getPropertyName() {
		return propertyName;
	}
}
