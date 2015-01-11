package io.riots.api.services.jms;

import io.riots.api.util.JSONUtil;

import java.util.Arrays;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;
import javax.jms.Topic;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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

	public static final String MQ_OUTBOUND_PROP_CHANGE_NOTIFY = "topic_propChangeNotify";
	public static final String MQ_INBOUND_PROP_UPDATE = "topic_propUpdateIn";
	public static final String CONTAINER_FACTORY_NAME = "topicContainerFactory";

	private static String BROKER_URL = "tcp://localhost:61616";
	private static AtomicBoolean BROKER_URL_DIRTY = new AtomicBoolean(true);

//	@Autowired
//	ServiceClientFactory clientFactory;
//	@Autowired
//    @Qualifier("jmsQueueTemplate")
//	JmsTemplate jmsQueueTemplate;
    @Autowired
    @Qualifier("jmsTopicTemplate")
    JmsTemplate jmsTopicTemplate;
	@Qualifier(EventBroker.MQ_INBOUND_PROP_UPDATE)
	@Autowired
	Topic topicPropUpdate;
	@Qualifier(EventBroker.MQ_OUTBOUND_PROP_CHANGE_NOTIFY)
	@Autowired
	Topic topicPropChange;

//    @Autowired
//    JmsTemplate jmsTemplate;

	public static enum SendType {
		TOPIC_PUBSUB, QUEUE_POINT2POINT
	}

	public void sendOutboundChangeNotifyMessage(Object prop) {
		sendMessage(MQ_OUTBOUND_PROP_CHANGE_NOTIFY, prop, SendType.TOPIC_PUBSUB);
	}

	public void sendInboundPropUpdateMessage(Object prop) {
		sendMessage(MQ_INBOUND_PROP_UPDATE, prop, SendType.TOPIC_PUBSUB);
	}

	public void sendMessage(String destination, Object payload, SendType type) {
		checkBrokerSettings();
		Destination dest = null;

		if(MQ_INBOUND_PROP_UPDATE.equals(destination)) {
			dest = topicPropUpdate;
		} else if(MQ_OUTBOUND_PROP_CHANGE_NOTIFY.equals(destination)) {
			dest = topicPropChange;
		}

		//System.out.println("Sending " + destination + " - " + type + " - " + " - " + destination);

//		if(type == SendType.TOPIC_PUBSUB) {
//			sendMessage(dest, theTemplate, payload);
//		} else {
//			// TODO
////			sendMessage(dest, jmsQueueTemplate, payload);
//		}
//		sendMessage(destination, jmsTopicTemplate, payload);
		sendMessage(dest, jmsTopicTemplate, payload);
	}

	public static void setBrokerURL(String brokerURL) {
		BROKER_URL = brokerURL;
		BROKER_URL_DIRTY.set(true);
	}

	/* PRIVATE HELPER METHODS */

	static void sendMessage(String destination, JmsTemplate template, Object payload) {

		template.send(destination, new MessageCreator() {
			public Message createMessage(Session session) throws JMSException {
				Message message = session.createTextMessage(JSONUtil
						.toJSON(payload));
				return message;
			}
		});
	}
	static void sendMessage(Destination destination, JmsTemplate template,
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
			for(JmsTemplate template : Arrays.asList(
//					jmsQueueTemplate, // TODO
					jmsTopicTemplate  // TODO
//					jmsTemplate
				)) {
				ActiveMQConnectionFactory fac = ((ActiveMQConnectionFactory) template
						.getConnectionFactory());
				if (!BROKER_URL.equals(fac.getBrokerURL())) {
					LOG.info("Updating ActiveMQ broker URL: " + BROKER_URL);
				}
				fac.setBrokerURL(BROKER_URL);
			}
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
