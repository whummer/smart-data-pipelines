package io.riots.api.events;

import io.riots.api.services.jms.EventBroker;
import io.riots.api.util.ServiceUtil;
import io.riots.core.repositories.PropertyValueRepository;
import io.riots.services.scenario.PropertyValue;

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
	EventBroker eventBroker;

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
