package io.riots.api.drivers.mqtt;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.junit.Ignore;

/**
 * @author whummer
 */
public class TestDriverUtilMQTT {

	@Ignore
	public void publishData() throws Exception {
		MqttClient c = new MqttClient("tcp://broker.mqtt-dashboard.com:1883", "foo123");
		c.connect();
		String topic = "riots/abc123";
		for(int i = 0; i < 50; i ++) {
			String payload = "" + i * Math.random();
			c.publish(topic, new MqttMessage(payload.getBytes()));
			Thread.sleep(200);
		}
		System.exit(0);
	}
}
