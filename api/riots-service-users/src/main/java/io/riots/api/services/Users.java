package io.riots.api.services;

import javax.ws.rs.Path;

import io.riots.api.handlers.query.UserQuery;
import io.riots.core.model.User;
import io.riots.core.service.IUsers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for managing users in the systems.
 * 
 * @author whummer
 */
@Service
@Path("/users")
public class Users implements IUsers {

    @Autowired
    UserQuery userQuery;

    public User findByID(String id) {
    	User u = userQuery.findById(id);
    	return u;
    }

    public User findByEmail(String email) {
    	User r = userQuery.findOrCreateByEmail(email);
    	return r;
    }

    public AuthToken login(GetAuthTokenRequest r) {
    	AuthToken response = new AuthToken();
    	response.network = r.network;
    	return response;
    }

}
