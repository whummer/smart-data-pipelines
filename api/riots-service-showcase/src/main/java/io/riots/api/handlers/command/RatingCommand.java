package io.riots.api.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.model.Rating;
import io.riots.core.repositories.RatingRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
// todo generify command handlers
@Component
public class RatingCommand {

    static final Logger log = LoggerFactory.getLogger(RatingCommand.class);

    @Autowired
    RatingRepository repository;

    public Rating create(Rating obj) {
        log.debug(Markers.COMMAND, "Persisting Rating {}", obj);
        return repository.save(obj);
    }

    public Rating update(Rating obj) {
        log.debug(Markers.COMMAND, "Updating Rating {}", obj);
        return repository.save(obj);
    }

    public void delete(String obj) {
        repository.delete(obj);
    }
}
