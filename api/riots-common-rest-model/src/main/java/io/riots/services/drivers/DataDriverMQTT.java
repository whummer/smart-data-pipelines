package io.riots.services.drivers;

import com.fasterxml.jackson.annotation.JsonProperty;


/**
 * Represents a device driver for MQTT protocols.
 * 
 * @author Waldemar Hummer
 */
public class DataDriverMQTT extends DataDriver {

	{
		connector = DriverConnector.MQTT;
	}

	@JsonProperty
	String brokerURL;

	@JsonProperty
	String topicFilter;

	@JsonProperty
	String payloadFormat;

	public String getBrokerURL() {
		return brokerURL;
	}
	public String getTopicFilter() {
		return topicFilter;
	}
	public String getPayloadFormat() {
		return payloadFormat;
	}
}
