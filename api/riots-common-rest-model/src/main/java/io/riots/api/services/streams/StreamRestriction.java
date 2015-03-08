package io.riots.api.services.streams;

import io.riots.api.services.model.Constants;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Models restrictions on data streams, e.g., 
 * certain properties of certain things should be 
 * hidden/removed from the stream.
 * @author whummer
 */
public class StreamRestriction implements ObjectIdentifiable {

	/**
	 * Identifier.
	 */
	@JsonProperty(Constants.ID)
	String id;
	/**
	 * Target thing id.
	 */
	@JsonProperty(Constants.THING_ID)
	String thingId;
	/**
	 * Target thing id.
	 */
	@JsonProperty(Constants.STREAM_ID)
	String streamId;
	/**
	 * Target thing property name.
	 */
	@JsonProperty(Constants.PROPERTY_NAME)
	String propertyName;
	/**
	 * Whether or not to hide this property.
	 */
	@JsonProperty
	boolean visible;


	public String getId() {
		return id;
	}
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
	public void setVisible(boolean visible) {
		this.visible = visible;
	}
	public boolean isVisible() {
		return visible;
	}
	public String getStreamId() {
		return streamId;
	}
	public void setStreamId(String streamId) {
		this.streamId = streamId;
	}

}
