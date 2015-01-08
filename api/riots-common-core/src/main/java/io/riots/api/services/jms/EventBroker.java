package io.riots.api.services.jms;

import java.util.concurrent.atomic.AtomicBoolean;

import io.riots.api.util.JSONUtil;
import io.riots.core.service.ServiceClientFactory;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;
import org.springframework.stereotype.Component;

/**
 * Common functionality for handling update events via our messaging
 * infrastructure.
 * 
 * @author whummer
 */
@Component
public class EventBroker {

	static final Logger LOG = Logger.getLogger(EventBroker.class);

	public static final String MQ_OUTBOUND_PROP_CHANGE_NOTIFY = "queue_propChangeNotify";
	public static final String MQ_INBOUND_PROP_UPDATE = "queue_propUpdateIn";

	private static String BROKER_URL = "tcp://localhost:61616";
	private static AtomicBoolean BROKER_URL_DIRTY = new AtomicBoolean(true);

	@Autowired
	JmsTemplate template;
	@Autowired
	ServiceClientFactory clientFactory;

	public void sendOutboundChangeNotifyMessage(Object prop) {
		sendMessage(MQ_OUTBOUND_PROP_CHANGE_NOTIFY, prop);
	}

	public void sendInboundPropUpdateMessage(Object prop) {
		sendMessage(MQ_INBOUND_PROP_UPDATE, prop);
	}

	public void sendMessage(String destination, Object payload) {
		checkBrokerSettings();
		sendMessage(destination, template, payload);
	}

	public static void setBrokerURL(String brokerURL) {
		BROKER_URL = brokerURL;
		BROKER_URL_DIRTY.set(true);
	}

	/* PRIVATE HELPER METHODS */

	private static void sendMessage(String destination, JmsTemplate template,
			Object payload) {

		template.send(destination, new MessageCreator() {
			public Message createMessage(Session session) throws JMSException {
				Message message = session.createTextMessage(JSONUtil
						.toJSON(payload));
				return message;
			}
		});
	}

	private void checkBrokerSettings() {
		if (BROKER_URL_DIRTY.get()) {
			ActiveMQConnectionFactory fac = ((ActiveMQConnectionFactory) template
					.getConnectionFactory());
			if (!BROKER_URL.equals(fac.getBrokerURL())) {
				LOG.info("Updating ActiveMQ broker URL: " + BROKER_URL);
			}
			fac.setBrokerURL(BROKER_URL);
			BROKER_URL_DIRTY.set(false);
		}
		// TODO dynamic lookup of broker URL, e.g., via Eureka
		// long now = System.currentTimeMillis();
		// boolean check = now - COUNT.get() > 1000 * 60; // check every 60
		// seconds
		// if(check) {
		// String host = clientFactory.getJmsBrokerHost();
		// String url = BROKER_URL.replace("0.0.0.0", host);
		// ActiveMQConnectionFactory fac =
		// ((ActiveMQConnectionFactory)template.getConnectionFactory());
		// if(!url.equals(fac.getBrokerURL())) {
		// LOG.info("Updating ActiveMQ broker URL: " + url);
		// }
		// fac.setBrokerURL(url);
		// COUNT.set(System.currentTimeMillis());
		// }
		// return check;
	}

}
