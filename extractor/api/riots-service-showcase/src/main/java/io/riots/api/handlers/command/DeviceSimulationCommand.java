package io.riots.api.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.model.sim.DeviceSimulation;
import io.riots.core.repositories.DeviceSimulationRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author Waldemar Hummer
 */
@Component
public class DeviceSimulationCommand {

    static final Logger log = LoggerFactory.getLogger(DeviceTypeCommand.class);

    @Autowired
    DeviceSimulationRepository repository;

    public DeviceSimulation create(DeviceSimulation item) {
        log.debug(Markers.COMMAND, "Persisting DeviceSimulation {}", item);
        return repository.save(item);
    }

    public DeviceSimulation update(DeviceSimulation item) {
        log.debug(Markers.COMMAND, "Updating DeviceSimulation {}", item);
        return repository.save(item);
    }

    public void delete(String itemId) {
        repository.delete(itemId);
    }
}
