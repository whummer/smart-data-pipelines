package io.riots.api.handlers.query;

import io.riots.core.model.User;
import io.riots.core.repositories.UserRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class UserQuery {

    @Autowired
    UserRepository repository;

    public User findOrCreateByEmail(String email) {
    	// TODO make atomic operation
    	User u = findByEmail(email);
    	if(u == null) {
    		u = new User();
    		u.setEmail(email);
    		repository.save(u);
    	}
    	return u;
    }

    public User findByEmail(String email) {
        List<User> res = repository.findByEmail(email);
        if(res.isEmpty())
        	return null;
        return res.get(0);
    }

}
