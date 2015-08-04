package io.riots.api.drivers.websocket;

import io.riots.api.services.scenarios.PropertyValue;
import io.riots.api.websocket.WebsocketMessage.WSMessageUnsubscribe;

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
		boolean result = val.getThingId().endsWith(thingId) && 
				val.getPropertyName().endsWith(propertyName);
		return result;
	}

	public boolean matches(WSMessageUnsubscribe m1, WebSocketSession session2) {
		if(clientId != null && !clientId.equals(m1.clientId)) {
			return false;
		}
		if(m1.unsubscribeAll) {
			// TODO: whu: consider multiple tenants and 
			// make sure different users don't interfere!
			return true;
		}
		boolean result = m1.thingId.endsWith(thingId) &&
				m1.propertyName.endsWith(propertyName);
		return result;
	}

	@Override
	public String toString() {
		return "WSSubscription [session=" + session + ", clientId=" + clientId
				+ ", thingId=" + thingId + ", propertyName=" + propertyName
				+ "]";
	}
	
}
