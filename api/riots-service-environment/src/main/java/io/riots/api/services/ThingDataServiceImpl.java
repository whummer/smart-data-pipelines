package io.riots.api.services;

import io.riots.api.services.jms.EventBroker;
import io.riots.api.util.JSONUtil;
import io.riots.api.util.ServiceUtil;
import io.riots.core.model.PropertyFinder;
import io.riots.core.repositories.PropertyValueRepository;
import io.riots.core.service.ServiceClientFactory;
import io.riots.services.CatalogService;
import io.riots.services.ThingDataService;
import io.riots.services.ThingsService;
import io.riots.services.catalog.Property;
import io.riots.services.catalog.ThingType;
import io.riots.services.scenario.PropertyValue;
import io.riots.services.scenario.Thing;

import java.net.URI;
import java.util.LinkedList;
import java.util.List;

import javax.jms.JMSException;
import javax.jms.TextMessage;
import javax.ws.rs.core.Context;

import org.apache.commons.lang.StringUtils;
import org.apache.cxf.jaxrs.ext.MessageContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;

/**
 * @author whummer
 */
@Service
@Api(value = "Thing Data", description = "Post and retrieve thing data.")
public class ThingDataServiceImpl implements ThingDataService {

    @Autowired
    PropertyValueRepository propValueRepo;

	@Autowired
	ServiceClientFactory serviceClientFactory;
	@Autowired
	PropertyFinder propertyFinder;

    @Context
    MessageContext context;
	@Autowired
	EventBroker eventBroker;

	/**
	 * This message is called each time we retrieve a status change
	 * generated in any of the currently running simulations.
	 */
	@JmsListener(destination = EventBroker.MQ_INBOUND_PROP_UPDATE)
	public void processSimulationUpdate(Object data) {
		PropertyValue prop = null;
		System.out.println("---> prop value update " + data);
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
    @Timed @ExceptionMetered
    public PropertyValue retrieveSinglePropertyValue(String propValueId)  {
    	return propValueRepo.findOne(propValueId);
    }

    @Override
    @Timed @ExceptionMetered
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
    @Timed @ExceptionMetered
    public List<PropertyValue> retrieve(String thingId,
    		String propertyName, int amount) {
    	List<PropertyValue> values = retrieveValues(thingId, propertyName, amount);
    	return values;
    }

    @Override
    @Timed @ExceptionMetered
	public void postValue(String thingId, String propertyName,
    		PropertyValue propValue) {
    	Property property = searchPropForThing(thingId, propertyName);
    	if(property == null) {
    		throw new IllegalArgumentException("Cannot find property '" +
    				propertyName + "' for thing '" + thingId + "'");
    	}
    	propValue.setPropertyName(propertyName);
    	propValue.setThingId(thingId);
    	postValue(propValue);
    }

    @Override
    @Timed @ExceptionMetered
    public long countDataItems() {
    	return propValueRepo.count();
    }

    @Override
    @Timed @ExceptionMetered
    public long countDataItemsForUser(String userId, long fromTime, long toTime) {
    	List<Thing> things = serviceClientFactory.getThingsServiceClient().retrieveThingsForUser(userId);
    	List<String> thingIds = new LinkedList<String>();
    	for(Thing t : things) {
    		thingIds.add(t.getId());
    	}
    	if(fromTime <= 0 && toTime <= 0) {
    		return propValueRepo.countByThingIdIn(thingIds);
    	} else {
    		return propValueRepo.countByThingIdInAndTimestampBetween(
    				thingIds, fromTime, toTime);
    	}
    }
    
    /* HELPER METHODS */

    private Property searchPropForThing(String thingId, String propertyName) {
    	ThingsService things = serviceClientFactory.getThingsServiceClient();
    	Thing thing = things.retrieve(thingId);
    	String thingTypeId = thing.getThingTypeId();
    	if(StringUtils.isEmpty(thingTypeId)) {
    		return null;
    	}
    	return searchPropForThingType(thingTypeId, propertyName);
    }
    private Property searchPropForThingType(String thingTypeId, String propertyName) {
    	CatalogService catalog = serviceClientFactory.getCatalogServiceClient();
    	ThingType tt = catalog.retrieveThingType(thingTypeId);
    	Property property = propertyFinder.findPropertyForThingType(tt, propertyName);
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
		eventBroker.sendOutboundChangeNotifyMessage(propValue);
    	return uri;
	}
}
