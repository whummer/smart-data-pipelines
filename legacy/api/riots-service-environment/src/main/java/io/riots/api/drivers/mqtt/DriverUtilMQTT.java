package io.riots.api.drivers.mqtt;

import io.riots.core.jms.EventBroker;
import io.riots.api.services.drivers.DataDriver;
import io.riots.api.services.drivers.DataDriverMQTT;
import io.riots.api.services.scenarios.PropertyValue;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.log4j.Logger;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Util class for connecting MQTT data streams to the platform.
 * @author whummer
 */
@Component
public class DriverUtilMQTT {

	private static final Logger LOG = Logger.getLogger(DriverUtilMQTT.class);

	private static final class Subscription {
		DataDriverMQTT driver;
		MqttClient client;
		String clientId;
		String brokerURL;
		String topicFilter;
		PropertyValue propValueTemplate;
	}

	/**
	 * Subscriptions
	 */
	private final Map<String,Subscription> subs = new ConcurrentHashMap<String, Subscription>();
	/**
	 * Autowired JMS, used for sending messages.
	 */
	@Autowired
	private EventBroker eventBroker;

	public void start(final String driverId, DataDriver driver) {
		final Subscription s = new Subscription();
		s.driver = (DataDriverMQTT)driver;
		int idLength = 23; // must not be longer than 23 chars
		s.clientId = UUID.randomUUID().toString().substring(0, idLength);
		try {
			s.brokerURL = s.driver.getBrokerURL();
			if(!s.brokerURL.contains("://")) {
				s.brokerURL = "tcp://" + s.brokerURL;
			}
			System.out.println("brokerURL: " + s.brokerURL);
			s.client = new MqttClient(s.brokerURL, s.clientId);
			s.client.connect();
			s.topicFilter = s.driver.getTopicFilter();
			s.client.subscribe(s.topicFilter);
			s.propValueTemplate = new PropertyValue();
			s.propValueTemplate.setPropertyName(driver.getPropertyName());
			s.propValueTemplate.setThingId(driver.getThingId());
			s.client.setCallback(new MqttCallback() {
				public void messageArrived(String topic, MqttMessage msg) throws Exception {
					String payload = new String(msg.getPayload());
					PropertyValue v = new PropertyValue(s.propValueTemplate, payload);
					v.setTimestamp(System.currentTimeMillis()); // TODO set time here?
					eventBroker.sendInboundPropUpdateMessage(v);
				}
				public void deliveryComplete(IMqttDeliveryToken arg0) {}
				public void connectionLost(Throwable arg0) {
					LOG.info("MQTT Connection lost: " + s.brokerURL + " - " + s.topicFilter);
				}
			});
			subs.put(driverId, s);
		} catch (Exception e) {
			LOG.warn("Cannot start MQTT listener.", e);
			throw new RuntimeException(e);
		}
	}

	public void stop(String driverId) {
		Subscription s = subs.get(driverId);
		if(s == null)
			return;
		try {
			s.client.unsubscribe(s.topicFilter);
			s.client.disconnect();
			subs.remove(driverId);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

}
