package io.riots.api.services;

import io.riots.api.services.jms.EventBroker;
import io.riots.api.util.JSONUtil;
import io.riots.api.util.ServiceUtil;
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
import java.util.List;

import javax.jms.JMSException;
import javax.jms.TextMessage;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;

import org.apache.cxf.jaxrs.ext.MessageContext;
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

    @Context
    MessageContext context;
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

		postValue(prop);
	}

	@Override
    public PropertyValue retrieveSinglePropertyValue(String propValueId)  {
    	return propValueRepo.findOne(propValueId);
    }

    @Override
    public PropertyValue retrieve(
    		String thingId, String propertyName) {
    	List<PropertyValue> values = retrieveValues(thingId, propertyName, 1);
    	PropertyValue value = null;
    	if(!values.isEmpty()) {
    		value = values.get(0);
    	}
    	return value;
    }

    @Override
    public List<PropertyValue> retrieve(String thingId,
    		String propertyName, int amount) {
    	List<PropertyValue> values = retrieveValues(thingId, propertyName, amount);
    	return values;
    }

    @Override
	public void postValue(String thingId, String propertyName, 
    		PropertyValue propValue) {
    	Property property = searchPropForThing(thingId, propertyName);
    	if(property == null) {
    		throw new IllegalArgumentException("Cannot find property '" + 
    				propertyName + "' for thing '" + thingId + "'");
    	}
    	propValue.setPropertyName(property.getName());
    	propValue.setThingId(thingId);
    	postValue(propValue);
    }

    /* HELPER METHODS */

    private Property searchPropForThing(String thingId, String propertyName) {
    	IThings things = serviceClientFactory.getThingsServiceClient();
    	Thing thing = things.retrieve(thingId);
    	String thingTypeId = thing.getThingTypeId();
    	return searchPropForThingType(thingTypeId, propertyName);
    }
    private Property searchPropForThingType(String thingTypeId, String propertyName) {
    	ICatalogService catalog = serviceClientFactory.getCatalogServiceClient();
    	ThingType tt = catalog.retrieveCatalogEntry(thingTypeId);
    	Property property = tt.getProperty(propertyName);
    	return property;
    }

    private List<PropertyValue> retrieveValues(String thingId, String propertyName, int amount) {
    	Property property = searchPropForThing(thingId, propertyName);
    	if(property == null) {
    		throw new IllegalArgumentException("Cannot find property '" + 
    				propertyName + "' for thing '" + thingId + "'");
    	}
    	List<PropertyValue> values = propValueRepo.findByThingIdAndPropertyName(thingId, propertyName, 
    			new PageRequest(0, amount, new Sort(Direction.DESC, "timestamp"))).getContent();
    	return values;
    }

	private URI postValue(PropertyValue propValue) {
		if(propValue.getTimestamp() <= 0) {
			propValue.setTimestamp(System.currentTimeMillis());
		}
    	propValue = propValueRepo.save(propValue);
    	URI uri = null;
		if(context != null && context.getHttpServletRequest() != null) {
			uri = ServiceUtil.getPath(context, String.format("../../data/%s", propValue.getId()));
		}
		EventBroker.sendMessage(EventBroker.MQ_PROP_CHANGE_NOTIFY, template, propValue);
    	return uri;
	}
}
