package io.riots.api.services.jms;

import io.riots.api.util.JSONUtil;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;

import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;
import org.springframework.stereotype.Component;

@Component
public class EventBroker {

	public static final String MQ_PROP_CHANGE_NOTIFY = "queue_propChangeNotify";
	public static final String MQ_PROP_SIM_UPDATE = "queue_propSimUpdate";

	public static void sendChangeNotifyMessage(JmsTemplate template, Object prop) {
		sendMessage(MQ_PROP_CHANGE_NOTIFY, template, prop);
	}

	public static void sendMessage(String destination, JmsTemplate template, Object payload) {
		template.send(destination, new MessageCreator() {
            public Message createMessage(Session session) throws JMSException {
                Message message = session.createTextMessage(JSONUtil.toJSON(payload));
                return message;
            }
        });
	}
}
