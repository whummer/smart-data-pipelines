package io.riots.api.services.streams;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by omoser on 06/03/15.
 *
 * @author omoser
 */
public class StreamSinkConfig {

	public String getEndpoint() {
		return endpoint;
	}

	enum SinkType {HTTP, MQTT, AMQP}

	@JsonProperty
	String endpoint;

}
