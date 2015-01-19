package io.riots.core.util.datainserter;

import io.riots.core.jms.EventBrokerComponent;
import io.riots.core.util.ServiceUtil;
import io.riots.core.repositories.PropertyValueRepository;
import io.riots.api.services.scenarios.PropertyValue;

import java.net.URI;

import javax.ws.rs.core.Context;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class DataInserter {

    @Autowired
    PropertyValueRepository propValueRepo;

    @Context
    MessageContext context;

    @Autowired
    EventBrokerComponent eventBroker;

	public URI postValue(PropertyValue propValue) {
		if(propValue.getTimestamp() <= 0) {
			propValue.setTimestamp(System.currentTimeMillis());
		}
    	propValue = propValueRepo.save(propValue);
    	URI uri = null;
		if(context != null && context.getHttpServletRequest() != null) {
			uri = ServiceUtil.getPath(context, String.format("../../data/%s", propValue.getId()));
		}
		eventBroker.sendOutboundChangeNotifyMessage(propValue);
    	return uri;
	}

}
