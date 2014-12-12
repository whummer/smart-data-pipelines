package io.riots.api.handlers.query;

import io.riots.core.model.Property;
import io.riots.core.repositories.PropertyRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class PropertyQuery {

    @Autowired
    PropertyRepository repository;

    public Property<?> single(String id) {
        return repository.findOne(id);
    }

    public List<Property<?>> query(Paged paged) {
        return repository.findAll(new PageRequest(
        		paged.getPage(), paged.getSize())).getContent();
    }
}
