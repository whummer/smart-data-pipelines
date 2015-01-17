package io.riots.api.services;

import io.riots.api.handlers.command.UserActionCommand;
import io.riots.api.handlers.query.UserActionQuery;
import io.riots.api.handlers.query.UserQuery;
import io.riots.core.auth.AuthHeaders;
import io.riots.services.UsersService;
import io.riots.services.users.Role;
import io.riots.services.users.User;
import io.riots.services.users.UserAction;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.NotImplementedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
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
    UserActionQuery userActionQuery;
    @Autowired
    UserActionCommand userActionCommand;

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
    @PreAuthorize(Role.HAS_ROLE_ADMIN)
    public List<User> listUsers() {
    	List<User> users = userQuery.find();
    	return users;
    }

    @Override
    @Timed @ExceptionMetered
    @PreAuthorize(Role.HAS_ROLE_ADMIN)
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

    @Override
    @Timed @ExceptionMetered
    public List<UserAction> getUserActions(GetUserActionsRequest req) {
    	return userActionQuery.find(req.getStartTime(), req.getEndTime(), 
    			req.getUserId(), req.getActionType(), req.getHttpPath(), 
    			req.getSizeFrom(), req.getSizeTo());
    }

    @Override
    @Timed @ExceptionMetered
    public void postUserAction(UserAction action) {
    	userActionCommand.create(action);
    }

}
