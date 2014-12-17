package io.riots.api.handlers.query;

import io.riots.core.model.sim.PropertySimulation;
import io.riots.core.repositories.PropertySimulationRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class PropertySimulationQuery {

    @Autowired
    PropertySimulationRepository repository;

    public PropertySimulation<?> single(String id) {
        return repository.findOne(id);
    }

    public List<PropertySimulation<?>> query(Paged paged) {
        return repository.findAll(new PageRequest(
        		paged.getPage(), paged.getSize())).getContent();
    }
}
