package io.riots.core.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.repositories.SimulationTypeRepository;
import io.riots.api.services.sim.SimulationType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author Waldemar Hummer
 */
@Component
public class SimulationTypeCommand {

    static final Logger log = LoggerFactory.getLogger(SimulationTypeCommand.class);

    @Autowired
    SimulationTypeRepository repository;

    public SimulationType create(SimulationType item) {
        log.debug(Markers.COMMAND, "Persisting SimulationType {}", item);
        return repository.save(item);
    }

    public SimulationType update(SimulationType item) {
        log.debug(Markers.COMMAND, "Updating SimulationType {}", item);
        return repository.save(item);
    }

    public void delete(String deviceId) {
        repository.delete(deviceId);
    }
}
