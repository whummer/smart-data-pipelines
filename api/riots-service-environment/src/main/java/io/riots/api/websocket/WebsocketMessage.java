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
		@JsonProperty
		public String thingId;
		@JsonProperty
		public String propertyName;
	}

	public static class WSMessageUnsubscribe extends WebsocketMessage {
		{
			type = MessageType.UNSUBSCRIBE;
		}
		@JsonProperty
		public String thingId;
		@JsonProperty
		public String propertyName;
		@JsonProperty
		public boolean unsubscribeAll = false;

		public boolean matches(WSSubscription sub, WebSocketSession currentSession) {
			if(unsubscribeAll) {
				System.out.println("ws session ids: " + sub.session.getId() + " - " + currentSession.getId());
				System.out.println(sub.session.getRemoteAddress() + " - " + currentSession.getRemoteAddress());
				return sub.session.getId().equals(currentSession.getId());
			}
			return sub.thingId.equals(thingId) && 
					sub.propertyName.equals(propertyName);
		}
	}

}
