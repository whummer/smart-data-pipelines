package io.riots.api.services.auth;

import io.riots.core.auth.AuthPermissionEvaluatorDefault;
import io.riots.core.repositories.ApplicationRepository;
import io.riots.core.repositories.ThingRepository;
import io.riots.services.users.Permission.Target;

import java.io.Serializable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Class which implements auth permission checking.
 * @author hummer
 */
@Component
public class AuthPermissionChecker implements PermissionEvaluator {

	@Autowired
	ThingRepository thingRepo;
	@Autowired
	ApplicationRepository appRepo;
	@Autowired
	AuthPermissionEvaluatorDefault defaultEvaluator;

    /* AUTHORIZATION METHODS */

    @Override
	public boolean hasPermission(Authentication authentication,
			Object targetDomainObject, Object permission) {
		return defaultEvaluator.hasPermission(
				authentication, targetDomainObject, permission);
	}

    @Override
	public boolean hasPermission(Authentication authentication,
			Serializable targetId, String targetType, Object permission) {
    	switch(targetType) {
	    	case Target.THING:
	    		return hasPermission(authentication, thingRepo.findOne((String)targetId), permission);
	    	case Target.APPLICATION:
	    		return hasPermission(authentication, appRepo.findOne((String)targetId), permission);
	    	default:
	        	throw new RuntimeException("Unknown type: " + targetType);
    	}
	}

}
