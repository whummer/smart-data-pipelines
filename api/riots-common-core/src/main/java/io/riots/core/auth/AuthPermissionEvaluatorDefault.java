package io.riots.core.auth;

import io.riots.core.auth.AuthHeaders.AuthInfo;
import io.riots.core.clients.ServiceClientFactory;
import io.riots.api.services.users.UsersService;
import io.riots.api.services.model.interfaces.ObjectCreated;
import io.riots.api.services.users.Permission.Operation;
import io.riots.api.services.users.Role;

import java.util.Arrays;
import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Checks authorization permissions, e.g., users can only delete items that have
 * been created by themselves.
 *
 * @author whummer
 */
@Component
public class AuthPermissionEvaluatorDefault {

	private static final Logger LOG = Logger.getLogger(AuthPermissionEvaluatorDefault.class);

	static final List<String> modificationOps = Arrays.asList(
			Operation.DELETE, Operation.UPDATE);

	@Autowired
	ServiceClientFactory clientFactory;

	public boolean hasPermission(Authentication authentication, 
			Object targetDomainObject, Object permission) {

		UsersService users = clientFactory.getUsersServiceClient(AuthHeaders.INTERNAL_CALL);

		AuthInfo info = (AuthInfo) authentication.getDetails();

		/* internal calls are permitted to do anything */
		if(info.isInternalCall()) {
			return true;
		}

		/* admins are permitted to do anything */
		if (info.roles.contains(Role.ROLE_ADMIN)) {
			return true;
		}

		/* non-users are permitted nothing */
		if (!info.roles.contains(Role.ROLE_USER)) {
			return false;
		}

		boolean isModification = modificationOps.contains(permission);

		if (isModification) {

			String creatingUserID = null;
			if (targetDomainObject instanceof ObjectCreated) {
				creatingUserID = ((ObjectCreated) targetDomainObject).getCreatorId();
			} else {
				LOG.warn("Unable to determine creating user for object " + targetDomainObject);
			}

			/* non-admin users may not modify objects which they did not create */
			if (creatingUserID == null) {
				return false;
			}

			/* make sure we have a valid user ID */
			if(info.userID == null) {
				info.userID = users.findByEmail(info.email).getId();
			}

			/* non-admin users may not modify objects which they did not create */
			if (!creatingUserID.equals(info.userID)) {
				return false;
			}
		}

		/* all looks good */
		return true;
	}

}
