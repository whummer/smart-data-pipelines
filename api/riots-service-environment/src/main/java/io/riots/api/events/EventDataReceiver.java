package io.riots.api.events;

import io.riots.api.services.jms.EventBroker;
import io.riots.api.util.JSONUtil;
import io.riots.services.scenario.PropertyValue;

import javax.jms.JMSException;
import javax.jms.TextMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class EventDataReceiver {

    @Autowired
    DataInserter dataInserter;

	/**
	 * This message is called each time we retrieve a status change
	 * generated in any of the currently running simulations.
	 */
	@JmsListener(containerFactory = EventBroker.CONTAINER_FACTORY_NAME,
			destination = EventBroker.MQ_INBOUND_PROP_UPDATE, 
			concurrency = "1")
	public void processSimulationUpdate(Object data) {
		//System.out.println("processSimulationUpdate " + data + " " + this + " - " + Thread.currentThread());
		PropertyValue prop = null;
		if(data instanceof String) {
			prop = JSONUtil.fromJSON((String)data, PropertyValue.class);
		} else if(data instanceof TextMessage) {
			try {
				prop = JSONUtil.fromJSON(((TextMessage)data).getText(), PropertyValue.class);
			} catch (JMSException e) {
				throw new RuntimeException(e);
			}
		} else if(data instanceof PropertyValue) {
			prop = (PropertyValue)data;
		} else {
			throw new IllegalArgumentException("Unknown update type: " + data);
		}

		dataInserter.postValue(prop);
	}

}
