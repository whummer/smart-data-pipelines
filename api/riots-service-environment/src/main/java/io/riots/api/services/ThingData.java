package io.riots.api.services;

import io.riots.api.services.jms.EventBroker;
import io.riots.api.util.JSONUtil;
import io.riots.core.repositories.PropertyValueRepository;
import io.riots.core.service.ICatalogService;
import io.riots.core.service.IThingData;
import io.riots.core.service.IThings;
import io.riots.core.service.ServiceClientFactory;
import io.riots.services.catalog.Property;
import io.riots.services.catalog.ThingType;
import io.riots.services.scenario.PropertyValue;
import io.riots.services.scenario.Thing;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import javax.jms.JMSException;
import javax.jms.TextMessage;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Path;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;

/**
 * @author whummer
 */
@Service
@Path("/things")
@Api(value = "Thing Data", description = "Post and retrieve thing data.")
public class ThingData implements IThingData {

    @Autowired
    PropertyValueRepository propValueRepo;

	@Autowired
	ServiceClientFactory serviceClientFactory;

    @Autowired
    HttpServletRequest req;

	@Autowired
    JmsTemplate template;

	/**
	 * This message is called each time we retrieve a status change 
	 * generated in any of the currently running simulations.
	 */
	@JmsListener(destination = EventBroker.MQ_PROP_SIM_UPDATE)
	public void processSimulationUpdate(Object data) {
		PropertyValue<?> prop = null;
		if(data instanceof String) {
			prop = JSONUtil.fromJSON((String)data, PropertyValue.class);
		} else if(data instanceof TextMessage) {
			try {
				prop = JSONUtil.fromJSON(((TextMessage)data).getText(), PropertyValue.class);
			} catch (JMSException e) {
				throw new RuntimeException(e);
			}
		} else if(data instanceof PropertyValue<?>) {
			prop = (PropertyValue<?>)data;
		} else {
			throw new IllegalArgumentException("Unknown update type: " + data);
		}

		postValue(prop);
	}

    @Override
    public PropertyValue<?> retrieve(
    		String deviceId, String propertyName) {
    	List<PropertyValue<?>> values = retrieveValues(deviceId, propertyName, 1);
    	PropertyValue<?> value = null;
    	if(!values.isEmpty()) {
    		value = values.get(0);
    	}
    	return value;
    }

    @Override
    public List<PropertyValue<?>> retrieve(String deviceId,
    		String propertyName, int amount) {
    	List<PropertyValue<?>> values = retrieveValues(deviceId, propertyName, amount);
    	return values;
    }

    @Override
	public void postValue(String deviceId, String propertyName, 
    		PropertyValue<?> propValue) {
    	IThings things = serviceClientFactory.getThingsServiceClient();
    	ICatalogService catalog = serviceClientFactory.getCatalogServiceClient();

    	Thing thing = things.retrieve(deviceId);
    	ThingType tt = catalog.retrieveCatalogEntry(thing.getThingTypeId());
    	Property property = tt.getProperty(propertyName);
    	propValue.setPropertyName(property.getName());
    	propValue.setThingId(thing.getId());
    	postValue(propValue);
    }

    /* HELPER METHODS */

    private List<PropertyValue<?>> retrieveValues(String thingId, String propertyName, int amount) {
    	//IThings things = ServiceClientFactory.getThingsServiceClient();
    	//ICatalogService catalog = ServiceClientFactory.getCatalogServiceClient();

    	//Thing thing = things.retrieve(thingId);
    	//ThingType tt = catalog.retrieveCatalogEntry(thing.getThingTypeId());
    	//Property prop = tt.getProperty(propertyName);
    	List<PropertyValue<?>> values = propValueRepo.findByThingIdAndPropertyName(thingId, propertyName, 
    			new PageRequest(1, amount, new Sort(Direction.DESC, "timestamp"))).getContent();
    	return values;
    }

	private URI postValue(PropertyValue<?> propValue) {
		if(propValue.getTimestamp() <= 0) {
			propValue.setTimestamp(System.currentTimeMillis());
		}
    	propValue = propValueRepo.save(propValue);
    	URI uri;
		try {
			uri = new URI(String.format("/devices/properties/{valueID}", propValue.getId()));
		} catch (URISyntaxException e) {
			throw new RuntimeException(e);
		}
    	EventBroker.sendMessage(EventBroker.MQ_PROP_CHANGE_NOTIFY, template, propValue);
    	return uri;
	}
}
