package io.riots.core.handlers.query;

import io.riots.core.repositories.PropertyValueRepository;
import io.riots.api.services.scenarios.PropertyValue;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
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
}