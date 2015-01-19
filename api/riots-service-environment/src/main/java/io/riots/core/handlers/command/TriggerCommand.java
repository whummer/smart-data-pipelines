package io.riots.core.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.repositories.TriggerRepository;
import io.riots.api.services.triggers.Trigger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class TriggerCommand {

    static final Logger log = LoggerFactory.getLogger(TriggerCommand.class);

    @Autowired
    TriggerRepository repository;

    public Trigger create(Trigger item) {
        log.debug(Markers.COMMAND, "Persisting Trigger {}", item);
        return repository.save(item);
    }

    public Trigger update(Trigger item) {
        log.debug(Markers.COMMAND, "Updating Trigger {}", item);
        return repository.save(item);
    }

    public void delete(String id) {
        repository.delete(id);
    }
}
