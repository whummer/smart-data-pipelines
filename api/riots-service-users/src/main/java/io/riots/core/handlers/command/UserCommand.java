package io.riots.core.handlers.command;

import io.riots.api.model.UserMongo;
import io.riots.core.logging.Markers;
import io.riots.core.repositories.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class UserCommand {

    static final Logger log = LoggerFactory.getLogger(UserCommand.class);

    @Autowired
    UserRepository repository;

    public UserMongo createOrUpdate(UserMongo obj) {
        log.debug(Markers.COMMAND, "Updating User {}", obj);
        return repository.save(obj);
    }

	public void delete(String id) {
        log.debug(Markers.COMMAND, "Deleting User {}", id);
        repository.delete(id);
	}

}
