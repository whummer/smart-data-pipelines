package io.riots.api.drivers.websocket;

import io.riots.api.services.scenarios.PropertyValue;

import org.springframework.web.socket.WebSocketSession;

/**
 * Captures a subscription to a Web socket data stream.
 * @author whummer
 */
public class WSSubscription {
	WebSocketSession session;
	String clientId;

	// TODO allow more complex filters
	String thingId;
	String propertyName;
	
	public boolean matches(PropertyValue val) {
		return thingId.equals(val.getThingId()) && 
				propertyName.equals(val.getPropertyName());
	}

	@Override
	public String toString() {
		return "WSSubscription [session=" + session + ", clientId=" + clientId
				+ ", thingId=" + thingId + ", propertyName=" + propertyName
				+ "]";
	}

	
}
