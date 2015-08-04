package io.riots.api.services.auth;

import io.riots.api.services.users.AuthInfo;
import io.riots.api.services.users.User;
import io.riots.core.auth.AuthPermissionEvaluatorDefault;
import io.riots.core.handlers.query.UserQuery;

import java.io.Serializable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Class which implements auth permission checking.
 * @author whummer
 */
@Component
public class AuthPermissionChecker implements PermissionEvaluator {

	@Autowired
	AuthPermissionEvaluatorDefault defaultEvaluator;
	@Autowired
	UserQuery userQuery;

    /* AUTHORIZATION METHODS */

    @Override
	public boolean hasPermission(Authentication authentication,
			Object targetDomainObject, Object permission) {
    	AuthInfo info = (AuthInfo) authentication.getDetails();
    	if(info.isAdmin()) {
    		return true;
    	}
    	if(targetDomainObject instanceof User) {
    		User user = (User)targetDomainObject;
    		return info.getUserID().equals(user.getId());
    	}
    	/* illegal parameter, return false. */
    	return false;
	}

    @Override
	public boolean hasPermission(Authentication authentication,
			Serializable targetId, String targetType, Object permission) {
    	Object obj = null;
    	String id = (String)targetId;
    	if(id.contains("@")) {
    		obj = userQuery.findByEmail(id);
    	} else {
    		obj = userQuery.findById(id);
    	}
     	return hasPermission(authentication, obj, permission);
	}

}
