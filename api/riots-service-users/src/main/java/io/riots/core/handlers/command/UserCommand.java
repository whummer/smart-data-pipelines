package io.riots.core.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.repositories.UserRepository;
import io.riots.api.services.users.User;

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

    public User update(User obj) {
        log.debug(Markers.COMMAND, "Persisting User {}", obj);
        return repository.save(obj);
    }

}
