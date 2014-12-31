package io.riots.api.websocket;

import io.riots.api.services.jms.EventBroker;
import io.riots.api.util.JSONUtil;
import io.riots.api.websocket.WebsocketMessage.WSMessageSubscribe;
import io.riots.api.websocket.WebsocketMessage.WSMessageUnsubscribe;
import io.riots.services.catalog.Property;
import io.riots.services.scenario.PropertyValue;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

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

	private static List<WSSubscription> subscriptions = new CopyOnWriteArrayList<>();
	private static final Logger LOG = Logger.getLogger(WebsocketHandler.class);

	@Autowired
	private JmsTemplate template;

	@JmsListener(destination = EventBroker.MQ_PROP_CHANGE_NOTIFY)
	public void processEvent(String data) {
		System.out.println("data: " + data);
		for (WSSubscription s : subscriptions) {
			try {
				PropertyValue obj = JSONUtil.fromJSON(data, PropertyValue.class);
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
		WebsocketMessage m = JSONUtil.fromJSON(message.getPayload(), WebsocketMessage.class);
		if(m instanceof WSMessageSubscribe) {
			WSMessageSubscribe m1 = (WSMessageSubscribe)m;
			WSSubscription s = new WSSubscription();
			s.session = session;
			s.thingId = m1.thingId;
			s.propertyName = m1.propertyName;
			subscriptions.add(s);
			startSim(s.thingId, m1.propertyName); // TODO temp
		} else if(m instanceof WSMessageUnsubscribe) {
			WSMessageUnsubscribe m1 = (WSMessageUnsubscribe)m;
			for (WSSubscription s : subscriptions) {
				if(m1.matches(s, session)) {
					terminate(s);
				}
			}
		} else {
			/* invalid message received */
			LOG.info("Unexpected message received from Websocket: " + m);
		}
	}

	private void terminate(WSSubscription sub) {
		subscriptions.remove(sub);
		try {
			sub.session.close();
		} catch (IOException e) {
			LOG.info("Unable to terminate Web socket subscription");
		}
	}

	private void startSim(String thingId, String propertyName) {
		// TODO remove
		new Thread() {
			public void run() {
				for (int i = 0; i < 10; i++) {
					try {
						Property p = new Property();
						p.setName(propertyName);
						PropertyValue v = new PropertyValue(p, Math.random());
						v.setThingId(thingId);
						v.setPropertyName(propertyName);
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
