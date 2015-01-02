package io.riots.api.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.repositories.PropertySimulationRepository;
import io.riots.services.sim.PropertySimulation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author Waldemar Hummer
 */
@Component
public class PropertySimulationCommand {

    static final Logger log = LoggerFactory.getLogger(PropertySimulationCommand.class);

    @Autowired
    PropertySimulationRepository repository;

    public PropertySimulation<?> create(PropertySimulation<?> item) {
        log.debug(Markers.COMMAND, "Persisting PropertySimulation {}", item);
        return repository.save(item);
    }

    public PropertySimulation<?> update(PropertySimulation<?> item) {
        log.debug(Markers.COMMAND, "Updating PropertySimulation {}", item);
        return repository.save(item);
    }

    public void delete(String itemId) {
        repository.delete(itemId);
    }
}
