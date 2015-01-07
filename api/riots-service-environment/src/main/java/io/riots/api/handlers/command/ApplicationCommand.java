package io.riots.api.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.repositories.ApplicationRepository;
import io.riots.services.apps.Application;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class ApplicationCommand {

    static final Logger log = LoggerFactory.getLogger(ApplicationCommand.class);

    @Autowired
    ApplicationRepository repository;

    public Application create(Application thing) {
        log.debug(Markers.COMMAND, "Persisting Application {}", thing);
        return repository.save(thing);
    }

    public Application update(Application thing) {
        log.debug(Markers.COMMAND, "Updating Application {}", thing);
        return repository.save(thing);
    }

    public void delete(String thingId) {
        repository.delete(thingId);
    }
}
