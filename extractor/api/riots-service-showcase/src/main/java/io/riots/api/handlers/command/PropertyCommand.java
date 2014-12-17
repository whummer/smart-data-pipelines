package io.riots.api.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.model.Property;
import io.riots.core.repositories.PropertyRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class PropertyCommand {

    static final Logger log = LoggerFactory.getLogger(PropertyCommand.class);

    @Autowired
    PropertyRepository repository;

    public Property<?> create(Property<?> item) {
        log.debug(Markers.COMMAND, "Persisting Property {}", item);
        return repository.save(item);
    }

    public Property<?> update(Property<?> item) {
        log.debug(Markers.COMMAND, "Updating Property {}", item);
        return repository.save(item);
    }

    public void delete(String itemId) {
        repository.delete(itemId);
    }
}
