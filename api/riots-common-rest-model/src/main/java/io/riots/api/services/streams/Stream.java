package io.riots.api.services.streams;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.riots.api.services.model.Constants;
import io.riots.api.services.model.interfaces.ObjectCreated;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;
import io.riots.api.services.model.interfaces.ObjectNamed;

import java.util.Date;

/**
 * Class to represent a data stream.
 *
 * @author whummer
 */
@JsonSubTypes({
		@Type(value = StreamOfThingPropValues.class, name = "THING_PROPERTY"),
		@Type(value = Stream.class, name = "CUSTOM")
})
@JsonTypeInfo(
		use = JsonTypeInfo.Id.NAME,
		include = JsonTypeInfo.As.PROPERTY,
		property = "type"
)
public class Stream implements ObjectIdentifiable, ObjectNamed, ObjectCreated {

	{
		type = StreamType.CUSTOM;
	}

	/**
	 * Identifier
	 */
	@JsonProperty(Constants.ID)
	String id;
	/**
	 * Name
	 */
	@JsonProperty(Constants.NAME)
	String name;
	/**
	 * Creator.
	 */
	@JsonProperty(Constants.CREATOR_ID)
	String creatorId;
	/**
	 * Creation Date.
	 */
	@JsonProperty(Constants.CREATION_DATE)
	Date created;
	/**
	 * Stream Type.
	 */
	@JsonProperty(Constants.TYPE)
	StreamType type;
	/**
	 * Pricing Model.
	 */
	@JsonProperty
	StreamPricing pricing;
	/**
	 * Stream sink config.
	 */
	@JsonProperty
	StreamSinkConfig sinkConfig;
	/**
	 * Whether this stream is publicly visible, searchable, queryable.
	 */
	@JsonProperty
	boolean visible;

	public String getName() {
		return name;
	}

	public String getId() {
		return id;
	}

	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	public String getCreatorId() {
		return creatorId;
	}

	public void setCreatorId(String creatorId) {
		this.creatorId = creatorId;
	}

	public StreamType getType() {
		return type;
	}

	public boolean isVisible() {
		return visible;
	}

	public StreamSinkConfig getSinkConfig() {
		return sinkConfig;
	}

	public void setSinkConfig(StreamSinkConfig sinkConfig) {
		this.sinkConfig = sinkConfig;
	}
}
