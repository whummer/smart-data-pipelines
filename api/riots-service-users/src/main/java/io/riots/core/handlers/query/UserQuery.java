package io.riots.core.handlers.query;

import io.riots.api.services.users.User;
import io.riots.core.repositories.UserRepository;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.google.common.collect.Iterables;

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
    		u = repository.save(u);
    	}
    	return u;
    }

    public User findByEmail(String email) {
        List<User> users = repository.findByEmail(email);
        if(users.isEmpty())
        	return null;
		if(users.size() > 1)
			throw new RuntimeException("Found multiple users with email '" + email + "'");
        return users.get(0);
    }

    public User findById(String id) {
        return repository.findOne(id);
    }

	public long getCount() {
		return repository.count();
	}

	public List<User> find() {
		return Arrays.asList(Iterables.toArray(
				repository.findAll(), User.class));
	}

}
