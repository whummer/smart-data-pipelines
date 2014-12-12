package io.riots.core.model.driver;

import com.fasterxml.jackson.annotation.JsonProperty;


/**
 * Represents a device driver for MQTT protocols.
 * 
 * @author Waldemar Hummer
 */
public class DeviceDriverMQTT extends DeviceDriver {

	{
		connector = DriverConnector.MQTT;
	}

	@JsonProperty
	String brokerURL;

	@JsonProperty
	String topicName;

	@JsonProperty
	String payloadFormat;

	public String getBrokerURL() {
		return brokerURL;
	}
	public String getTopicName() {
		return topicName;
	}
	public String getPayloadFormat() {
		return payloadFormat;
	}
}
