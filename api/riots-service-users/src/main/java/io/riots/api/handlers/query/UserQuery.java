package io.riots.api.handlers.query;

import io.riots.core.repositories.UserRepository;
import io.riots.services.users.User;

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
        List<User> res = repository.findByEmail(email);
        if(res.isEmpty())
        	return null;
        return res.get(0);
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
