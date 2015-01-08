package io.riots.api.websocket;

import io.riots.api.services.jms.EventBroker;
import io.riots.api.util.JSONUtil;
import io.riots.api.websocket.WebsocketMessage.WSMessageSubscribe;
import io.riots.api.websocket.WebsocketMessage.WSMessageUnsubscribe;
import io.riots.services.scenario.PropertyValue;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;
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

	private static Map<String,WSSubscription> subscriptions = new ConcurrentHashMap<>();
	private static final Logger LOG = Logger.getLogger(WebsocketHandler.class);

	@Autowired
	private JmsTemplate template;

	@JmsListener(destination = EventBroker.MQ_OUTBOUND_PROP_CHANGE_NOTIFY)
	public void processEvent(String data) {
		System.out.println("data: " + data);
		PropertyValue obj = JSONUtil.fromJSON(data, PropertyValue.class);
		for (String key : subscriptions.keySet()) {
			WSSubscription s = subscriptions.get(key);
			try {
				if(s.matches(obj)) {
					s.session.sendMessage(new TextMessage(data));
				}
			} catch (Exception e) {
				if(!s.session.isOpen()) {
					removeSubscription(s);
				}
			}
		}
	}

	private void removeSubscription(WSSubscription s) {
		subscriptions.remove(s.session.getId());
	}

	@Override
	public void handleTextMessage(WebSocketSession session, TextMessage message) {
		WebsocketMessage m = JSONUtil.fromJSON(message.getPayload(), WebsocketMessage.class);
		if(m instanceof WSMessageSubscribe) {
			WSMessageSubscribe m1 = (WSMessageSubscribe)m;
			WSSubscription s = new WSSubscription();
			s.session = session;
			s.thingId = m1.thingId;
			s.clientId = m1.clientId;
			s.propertyName = m1.propertyName;
			subscriptions.put(session.getId(), s);
			//startSim(s.thingId, m1.propertyName); // TODO temp
		} else if(m instanceof WSMessageUnsubscribe) {
			WSMessageUnsubscribe m1 = (WSMessageUnsubscribe)m;
			WSSubscription sub = subscriptions.get(session.getId());
			if(sub != null) {
				terminate(sub, m1.closeConnection);
			}
			if(m1.unsubscribeAll) {
				for (String id : subscriptions.keySet()) {
					WSSubscription s = subscriptions.get(id);
					System.out.println("Subscription matches: " + 
							m1.matches(s, session) + " - " + s + " - " + session);
					if(m1.matches(s, session)) {
						terminate(s, m1.closeConnection);
					}
				}
			}
		} else {
			/* invalid message received */
			LOG.info("Unexpected message received from Websocket: " + m);
		}
	}

	private void terminate(WSSubscription sub, boolean closeSession) {
		removeSubscription(sub);
		try {
			if(closeSession)
				sub.session.close();
		} catch (Exception e) {
			LOG.info("Unable to terminate Web socket subscription");
		}
	}

//	TODO remove
//	private void startSim(String thingId, String propertyName) {
//		new Thread() {
//			public void run() {
//				for (int i = 0; i < 10; i++) {
//					try {
//						Property p = new Property();
//						p.setName(propertyName);
//						PropertyValue v = new PropertyValue(p, Math.random());
//						v.setThingId(thingId);
//						v.setPropertyName(propertyName);
//						v.setTimestamp(System.currentTimeMillis());
//						EventBroker.sendMessage(EventBroker.MQ_PROP_SIM_UPDATE, template, v);
//						try {
//							Thread.sleep(1000);
//						} catch (InterruptedException e) {
//						}
//					} catch (Exception e) {
//						e.printStackTrace();
//						break;
//					}
//				}
//			}
//		}.start();
//	}

}
