package io.riots.api.services;

import io.riots.api.events.DataInserter;
import io.riots.api.events.EventBrokerComponent;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.model.PropertyFinder;
import io.riots.core.repositories.PropertyValueRepository;
import io.riots.core.service.ServiceClientFactory;
import io.riots.services.ThingDataService;
import io.riots.services.ThingsService;
import io.riots.services.catalog.Property;
import io.riots.services.scenario.PropertyValue;
import io.riots.services.scenario.Thing;

import java.util.LinkedList;
import java.util.List;

import javax.ws.rs.core.Context;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;

/**
 * @author whummer
 */
@Service
@Scope("singleton")
@Api(value = "Thing Data", description = "Post and retrieve thing data.")
public class ThingDataServiceImpl implements ThingDataService {

    @Autowired
    PropertyValueRepository propValueRepo;

	@Autowired
	ServiceClientFactory serviceClientFactory;
	@Autowired
	PropertyFinder propertyFinder;
	@Autowired
	DataInserter dataInserter;

    @Context
    MessageContext context;
	@Autowired
	EventBrokerComponent eventBroker;

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
    	Property property = propertyFinder.searchPropForThing(thingId, propertyName);
    	if(property == null) {
    		throw new IllegalArgumentException("Cannot find property '" +
    				propertyName + "' for thing '" + thingId + "'");
    	}
    	propValue.setPropertyName(propertyName);
    	propValue.setThingId(thingId);
    	dataInserter.postValue(propValue);
    }

    @Override
    @Timed @ExceptionMetered
    public long countDataItems() {
    	return propValueRepo.count();
    }

    @Override
    @Timed @ExceptionMetered
    public long countDataItemsForUser(String userId, long fromTime, long toTime) {
    	ThingsService service = serviceClientFactory.getThingsServiceClient(AuthHeaders.INTERNAL_CALL);
    	List<Thing> things = service.retrieveThingsForUser(userId);
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

    private List<PropertyValue> retrieveValues(String thingId, String propertyName, int amount) {
    	Property property = propertyFinder.searchPropForThing(thingId, propertyName);
    	if(property == null) {
    		throw new IllegalArgumentException("Cannot find property '" +
    				propertyName + "' for thing '" + thingId + "'");
    	}
    	List<PropertyValue> values = propValueRepo.findByThingIdAndPropertyName(thingId, propertyName,
    			new PageRequest(0, amount, new Sort(Direction.DESC, "timestamp"))).getContent();
    	return values;
    }

}
