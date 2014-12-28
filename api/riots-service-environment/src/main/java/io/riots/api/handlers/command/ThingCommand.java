package io.riots.api.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.repositories.ThingRepository;
import io.riots.model.ThingMongo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
@Component
public class ThingCommand {

    static final Logger log = LoggerFactory.getLogger(ThingCommand.class);

    @Autowired
    ThingRepository repository;

    public ThingMongo create(ThingMongo thing) {
        log.debug(Markers.COMMAND, "Persisting Thing {}", thing);
        return repository.save(thing);
    }

    public ThingMongo update(ThingMongo thing) {
        log.debug(Markers.COMMAND, "Updating Thing {}", thing);
        return repository.save(thing);
    }

    public void delete(String thingId) {
        repository.delete(thingId);
    }
}
