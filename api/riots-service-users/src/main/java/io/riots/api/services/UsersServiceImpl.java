package io.riots.api.services;

import io.riots.api.handlers.query.UserQuery;
import io.riots.core.auth.AuthHeaders;
import io.riots.services.UsersService;
import io.riots.services.users.User;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.NotImplementedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;

/**
 * Service for managing users in the systems.
 *
 * @author whummer
 */
@Service
public class UsersServiceImpl implements UsersService {

    @Autowired
    UserQuery userQuery;

    @Autowired
    HttpServletRequest req;
    @Autowired
    AuthHeaders authHeaders;

	@Override
	@Timed @ExceptionMetered
    public User getInfoAboutMe() {
		User user = authHeaders.getRequestingUser(req);
		return user;
	}

    @Override
    @Timed @ExceptionMetered
    public User findByID(String id) {
    	User u = userQuery.findById(id);
    	return u;
    }

    @Override
    @Timed @ExceptionMetered
    public User findByEmail(String email) {
    	User r = userQuery.findOrCreateByEmail(email);
    	return r;
    }

    @Override
    @Timed @ExceptionMetered
    public AuthToken login(GetAuthTokenRequest r) {
    	AuthToken response = new AuthToken();
    	response.network = r.network;
    	// TODO implement
    	throw new NotImplementedException();
    }

    @Override
    @Timed @ExceptionMetered
    public long getNumUsers() {
    	return userQuery.getCount();
    }

}
