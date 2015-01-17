package io.riots.api.handlers.query;

import io.riots.core.repositories.UserActionRepository;
import io.riots.services.users.UserAction;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class UserActionQuery {

    @Autowired
    UserActionRepository repository;

    public List<UserAction> find(long from, long to, String user, 
    		String type, String httpPath, long sizeFrom, long sizeTo) {
    	if(to <= 0) {
    		to = new Date().getTime();
    	}
    	if(from > to) {
    		from = to;
    	}
    	return repository.findBy(from, to, user, type, httpPath, sizeFrom, sizeTo);
    }
}
