package io.riots.api.services;

import io.riots.api.handlers.query.UserQuery;
import io.riots.core.service.UsersService;
import io.riots.services.users.User;

import javax.ws.rs.Path;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for managing users in the systems.
 *
 * @author whummer
 */
@Service
@Path("/users")
public class Users implements UsersService {

    @Autowired
    UserQuery userQuery;

    @Override
    public User findByID(String id) {
    	User u = userQuery.findById(id);
    	return u;
    }

    @Override
    public User findByEmail(String email) {
    	User r = userQuery.findOrCreateByEmail(email);
    	return r;
    }

    @Override
    public AuthToken login(GetAuthTokenRequest r) {
    	AuthToken response = new AuthToken();
    	response.network = r.network;
    	return response;
    }

    @Override
    public long getNumUsers() {
    	return userQuery.getCount();
    }
}
