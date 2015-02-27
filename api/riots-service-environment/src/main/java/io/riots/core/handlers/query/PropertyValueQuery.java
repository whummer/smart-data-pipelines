package io.riots.core.handlers.query;

import io.riots.api.services.scenarios.PropertyValue;
import io.riots.core.repositories.PropertyValueRepository;

import java.util.List;
import java.util.stream.Collectors;

import io.riots.core.util.JSONUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class PropertyValueQuery {

    @Autowired
    PropertyValueRepository repository;

    public PropertyValue single(String id) {
        return repository.findOne(id);
    }

    public List<PropertyValue> query(Paged paged) {
        return repository.findAll(new PageRequest(
        		paged.getPage(), paged.getSize())).getContent();
    }

    public List<PropertyValue> retrieveValues(String thingId, String propertyName, int amount) {
    	List<PropertyValue> values = repository.findByThingIdAndPropertyName(thingId, propertyName,
    			new PageRequest(0, amount, new Sort(Direction.DESC, "timestamp"))).getContent();
    	return values;
    }


	public List<String> retrieveValuesAsJson(String thingId, String propertyName, int amount) {
    	List<PropertyValue> values = repository.findByThingIdAndPropertyName(thingId, propertyName,
    			new PageRequest(0, amount, new Sort(Direction.DESC, "timestamp"))).getContent();

		return values.stream().map(propertyValue -> JSONUtil.toJSON(propertyValue)).collect(Collectors.toList());
    }

}
