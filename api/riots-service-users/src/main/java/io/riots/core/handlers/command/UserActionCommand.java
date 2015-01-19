package io.riots.core.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.repositories.UserActionRepository;
import io.riots.api.services.users.UserAction;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class UserActionCommand {

    static final Logger log = LoggerFactory.getLogger(UserActionCommand.class);

    @Autowired
    UserActionRepository repository;

    public UserAction create(UserAction obj) {
        log.debug(Markers.COMMAND, "Persisting UserAction {}", obj);
        if(obj.getBytesIn() < 0)
        	obj.setBytesIn(0);
        if(obj.getBytesOut() < 0)
        	obj.setBytesOut(0);
        return repository.save(obj);
    }

}