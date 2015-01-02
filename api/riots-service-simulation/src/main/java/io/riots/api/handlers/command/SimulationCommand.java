package io.riots.api.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.repositories.SimulationRepository;
import io.riots.services.sim.Simulation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author Waldemar Hummer
 */
@Component
public class SimulationCommand {

    static final Logger log = LoggerFactory.getLogger(SimulationCommand.class);

    @Autowired
    SimulationRepository repository;

    public Simulation create(Simulation item) {
        log.debug(Markers.COMMAND, "Persisting Simulation {}", item);
        return repository.save(item);
    }

    public Simulation update(Simulation item) {
        log.debug(Markers.COMMAND, "Updating Simulation {}", item);
        return repository.save(item);
    }

    public void delete(String deviceId) {
        repository.delete(deviceId);
    }
}
