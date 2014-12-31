package io.riots.api.websocket;

import io.riots.services.scenario.PropertyValue;

import org.springframework.web.socket.WebSocketSession;

/**
 * Captures a subscription to a Web socket data stream.
 * @author whummer
 */
public class WSSubscription {
	WebSocketSession session;

	// TODO allow more complex filters
	String thingId;
	String propertyName;
	
	public boolean matches(PropertyValue val) {
		return thingId.equals(val.getThingId()) && 
				propertyName.equals(val.getPropertyName());
	}

}
