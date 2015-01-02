package io.riots.api.websocket;

import org.springframework.web.socket.WebSocketSession;

import io.riots.api.websocket.WebsocketMessage.WSMessageSubscribe;
import io.riots.api.websocket.WebsocketMessage.WSMessageUnsubscribe;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Container for Web socket messages exchanged between 
 * clients (e.g., browsers) and the API services.
 * @author whummer
 */
@JsonSubTypes({
	@Type(value = WSMessageSubscribe.class, name="SUBSCRIBE"),
	@Type(value = WSMessageUnsubscribe.class, name="UNSUBSCRIBE")
})
@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	include = JsonTypeInfo.As.PROPERTY,
	property = "type"
)
public class WebsocketMessage {

	MessageType type;

	public static enum MessageType {
		SUBSCRIBE, UNSUBSCRIBE
	}

	public static class WSMessageSubscribe extends WebsocketMessage {
		{
			type = MessageType.SUBSCRIBE;
		}
		/** ID of requesting client. */
		@JsonProperty
		public String clientId;
		/** thing of interest */
		@JsonProperty
		public String thingId;
		/** thing property of interest */
		@JsonProperty
		public String propertyName;
	}

	public static class WSMessageUnsubscribe extends WebsocketMessage {
		{
			type = MessageType.UNSUBSCRIBE;
		}
		@JsonProperty
		public String clientId;
		@JsonProperty
		public String thingId;
		@JsonProperty
		public String propertyName;
		@JsonProperty
		public boolean unsubscribeAll = false;
		@JsonProperty
		public boolean closeConnection = false;

		public boolean matches(WSSubscription sub, WebSocketSession currentSession) {
			if(sub.clientId != null && !sub.clientId.equals(clientId)) {
				return false;
			}
			if(unsubscribeAll) {
				// TODO: whu: consider multiple tenants and 
				// make sure different users don't interfere!
				return true;
			}
			return sub.thingId.equals(thingId) && 
					sub.propertyName.equals(propertyName);
		}
	}

}
