package io.riots.api.services.auth;

import io.riots.core.auth.AuthPermissionEvaluatorDefault;

import java.io.Serializable;

import org.apache.commons.lang.NotImplementedException;
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

    /* AUTHORIZATION METHODS */

    @Override
	public boolean hasPermission(Authentication authentication,
			Object targetDomainObject, Object permission) {
    	throw new NotImplementedException();
	}

    @Override
	public boolean hasPermission(Authentication authentication,
			Serializable targetId, String targetType, Object permission) {
    	throw new NotImplementedException();
	}

}
