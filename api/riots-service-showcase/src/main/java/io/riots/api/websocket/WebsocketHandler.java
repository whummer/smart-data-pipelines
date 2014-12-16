package io.riots.api.websocket;

import io.riots.api.services.jms.EventBroker;
import io.riots.api.util.JSONUtil;
import io.riots.api.websocket.WebsocketMessage.WSMessageSubscribe;
import io.riots.api.websocket.WebsocketMessage.WSMessageUnsubscribe;
import io.riots.core.model.Property;
import io.riots.core.model.PropertyValue;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * Class for handling Websocket communication.
 * 
 * @author whummer
 */
@Component
public class WebsocketHandler extends TextWebSocketHandler {

	private static List<Subscription> subscriptions = new CopyOnWriteArrayList<Subscription>();

	@Autowired
	private JmsTemplate template;

	private static class Subscription {
		WebSocketSession session;
		String propertyID; // TODO allow more complex filters
		
		boolean matches(PropertyValue<?> val) {
			return propertyID.equals(val.getProperty().getId());
		}
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session)
			throws Exception {
//		System.out.println("WebSocket connection established! "
//				+ session.getHandshakeHeaders());
		super.afterConnectionEstablished(session);
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session,
			CloseStatus status) throws Exception {
		super.afterConnectionClosed(session, status);
	}

	@JmsListener(destination = EventBroker.MQ_PROP_CHANGE_NOTIFY)
	public void processEvent(String data) {
		System.out.println("data: " + data);
		for (Subscription s : subscriptions) {
			try {
				PropertyValue<?> obj = JSONUtil.fromJSON(data, PropertyValue.class);
				if(s.matches(obj)) {
					s.session.sendMessage(new TextMessage(data));
				}
			} catch (Exception e) {
				if(!s.session.isOpen()) {
					subscriptions.remove(s);
				}
			}
		}
	}

	@Override
	public void handleTextMessage(WebSocketSession session, TextMessage message) {
		System.out.println("Incoming message: " + message);
		WebsocketMessage m = JSONUtil.fromJSON(message.getPayload(), WebsocketMessage.class);
		if(m instanceof WSMessageSubscribe) {
			WSMessageSubscribe m1 = (WSMessageSubscribe)m;
			Subscription s = new Subscription();
			s.session = session;
			s.propertyID = m1.propertyID;
			subscriptions.add(s);
			startSim(m1.propertyID); // TODO temp
		} else if(m instanceof WSMessageUnsubscribe) {
			WSMessageUnsubscribe m1 = (WSMessageUnsubscribe)m;
		} else {
			/* invalid message received */
		}
	}

	private void startSim(String propertyID) {
		// TODO remove
		new Thread() {
			public void run() {
				for (int i = 0; i < 10; i++) {
					try {
						Property<Double> p = new Property<Double>();
						p.setId(propertyID);
						PropertyValue<Double> v = new PropertyValue<>(
								p, Math.random());
						v.setTimestamp(System.currentTimeMillis());
						EventBroker.sendMessage(EventBroker.MQ_PROP_SIM_UPDATE, template, v);
						try {
							Thread.sleep(1000);
						} catch (InterruptedException e) {
						}
					} catch (Exception e) {
						e.printStackTrace();
						break;
					}
				}
			}
		}.start();
	}

}
