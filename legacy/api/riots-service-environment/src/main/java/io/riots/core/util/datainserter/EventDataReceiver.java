package io.riots.core.util.datainserter;

import io.riots.core.jms.EventBroker;
import io.riots.core.util.datainserter.DataInserter;
import io.riots.core.util.JSONUtil;
import io.riots.api.services.scenarios.PropertyValue;

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
	 * This message is called each time we retrieve a property value update
	 * EITHER
	 *  - from an external API call,
	 * OR
	 *  - in any of the currently running simulations.
	 */
	@JmsListener(containerFactory = EventBroker.CONTAINER_FACTORY_NAME,
			destination = EventBroker.MQ_INBOUND_PROP_UPDATE, 
			concurrency = "1")
	public void processUpdate(Object data) {
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