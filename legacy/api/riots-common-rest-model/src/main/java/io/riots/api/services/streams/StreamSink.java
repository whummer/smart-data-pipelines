package io.riots.api.services.streams;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.riots.api.services.model.Constants;
import io.riots.api.services.model.interfaces.ObjectCreated;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;
import io.riots.api.services.model.interfaces.ObjectNamed;

import java.io.Serializable;
import java.util.Date;

/**
 * Created by omoser on 09/03/15.
 *
 * @author omoser
 */

@JsonSubTypes({
		@JsonSubTypes.Type(value = StreamSinkHttpEndpoint.class, name = "HTTP"),
		@JsonSubTypes.Type(value = StreamSinkAmqpEndpoint.class, name = "AMQP")
})
@JsonTypeInfo(
		use = JsonTypeInfo.Id.NAME,
		include = JsonTypeInfo.As.PROPERTY,
		property = "type"
)
public class StreamSink implements ObjectIdentifiable, ObjectNamed, ObjectCreated {

	public enum StreamSinkType {
		FILE, HTTP, AMQP
	}

	{
		type = StreamSinkType.FILE;
	}

	@JsonProperty(Constants.ID)
	String id;

	@JsonProperty(Constants.NAME)
	String name;

	@JsonProperty(Constants.CREATOR_ID)
	String creatorId;

	@JsonProperty(Constants.CREATION_DATE)
	Date created;

	@JsonProperty(Constants.TYPE)
	StreamSinkType type;

	@JsonProperty("sink-filename")
	String sinkFilename;

	@JsonProperty("active")
	boolean active;

	@JsonProperty("create-xd-stream")
	boolean createXdStream;

	@JsonProperty("xd-definition")
	String xdStreamDefinition;

	@Override
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	@Override
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Override
	public String getCreatorId() {
		return creatorId;
	}

	public void setCreatorId(String creatorId) {
		this.creatorId = creatorId;
	}

	@Override
	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	public StreamSinkType getType() {
		return type;
	}

	public void setType(StreamSinkType type) {
		this.type = type;
	}

	public String getSinkFilename() {
		return sinkFilename;
	}

	public void setSinkFilename(String sinkFilename) {
		this.sinkFilename = sinkFilename;
	}

	public boolean isCreateXdStream() {
		return createXdStream;
	}

	public void setCreateXdStream(boolean createXdStream) {
		this.createXdStream = createXdStream;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public String getXdStreamDefinition() {
		return xdStreamDefinition;
	}

	public void setXdStreamDefinition(String xdStreamDefinition) {
		this.xdStreamDefinition = xdStreamDefinition;
	}

	public StreamSink withId(final String id) {
		this.id = id;
		return this;
	}

	public StreamSink withName(final String name) {
		this.name = name;
		return this;
	}

	public StreamSink withCreatorId(final String creatorId) {
		this.creatorId = creatorId;
		return this;
	}

	public StreamSink withCreated(final Date created) {
		this.created = created;
		return this;
	}

	public StreamSink withType(final StreamSinkType type) {
		this.type = type;
		return this;
	}

	public StreamSink withSinkFilename(final String sinkFilename) {
		this.sinkFilename = sinkFilename;
		return this;
	}

	public StreamSink withActive(final boolean active) {
		this.active = active;
		return this;
	}

	public StreamSink withCreateXdStream(final boolean createXdStream) {
		this.createXdStream = createXdStream;
		return this;
	}

	public StreamSink withXdStreamDefinition(final String xdStreamDefinition) {
		this.xdStreamDefinition = xdStreamDefinition;
		return this;
	}


	@Override
	public String toString() {
		return "StreamSink{" +
				"id='" + id + '\'' +
				", name='" + name + '\'' +
				", creatorId='" + creatorId + '\'' +
				", created=" + created +
				", type=" + type +
				", sinkFilename='" + sinkFilename + '\'' +
				'}';
	}
}
