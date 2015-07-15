package io.riots.api.services.streams;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by omoser on 09/03/15.
 *
 * @author omoser
 */
public class StreamSinkHttpEndpoint extends StreamSink {

	{
		type = StreamSinkType.HTTP;
	}

	@JsonProperty("endpoint-url")
	String endpointUrl;


	public String getEndpointUrl() {
		return endpointUrl;
	}

	public void setEndpointUrl(String endpointUrl) {
		this.endpointUrl = endpointUrl;
	}

	public StreamSinkHttpEndpoint withEndpointUrl(final String endpointUrl) {
		this.endpointUrl = endpointUrl;
		return this;
	}

	public StreamSinkHttpEndpoint withId(final String id) {
		this.id = id;
		return this;
	}

	public StreamSinkHttpEndpoint withName(final String name) {
		this.name = name;
		return this;
	}

	public StreamSinkHttpEndpoint withCreatorId(final String creatorId) {
		this.creatorId = creatorId;
		return this;
	}

	public StreamSinkHttpEndpoint withCreated(final java.util.Date created) {
		this.created = created;
		return this;
	}

	public StreamSinkHttpEndpoint withType(final StreamSinkType type) {
		this.type = type;
		return this;
	}

	public StreamSinkHttpEndpoint withSinkFilename(final String sinkFilename) {
		this.sinkFilename = sinkFilename;
		return this;
	}

	public StreamSinkHttpEndpoint withActive(final boolean active) {
		this.active = active;
		return this;
	}

	@Override
	public String toString() {
		return "StreamSinkHttpEndpoint{" +
				"endpointUrl='" + endpointUrl + '\'' +
				"} " + super.toString();
	}
}
