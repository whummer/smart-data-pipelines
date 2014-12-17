package io.riots.core.auth;

import io.riots.core.auth.AuthFilter.AuthInfo;
import io.riots.core.model.BaseObjectCreated;
import io.riots.core.model.Permission.Operation;
import io.riots.core.model.Permission.Target;
import io.riots.core.model.Role;
import io.riots.core.model.User;
import io.riots.core.repositories.BaseObjectRepository;
import io.riots.core.repositories.DeviceTypeRepository;
import io.riots.core.repositories.UserRepository;

import java.io.Serializable;
import java.util.Arrays;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Checks authorization permissions, e.g., users can only delete items that have
 * been created by themselves.
 * 
 * @author whummer
 */
@Component
public class AuthPermissionChecker implements PermissionEvaluator {

	@Autowired
	private DeviceTypeRepository repoDevType;
	@Autowired
	private UserRepository repoUser;

	@Autowired
	private HttpServletRequest req;

	List<String> modificationOps = Arrays.asList(Operation.DELETE,
			Operation.UPDATE);

	/**
	 * Implement {@link PermissionEvaluator}.hasPermission(...)
	 */
	@Override
	public boolean hasPermission(Authentication authentication,
			Object targetDomainObject, Object permission) {

		// System.out.println("!!! hasPermission: " + authentication + " - "
		// + targetDomainObject + " - " + permission);
		AuthInfo info = (AuthInfo) authentication.getDetails();
		if (info.user == null) {
			info.user = AuthFilter.getRequestingUser(info.email, info.userName,
					repoUser);
		}
		// System.out.println("info.user " + info.user + " - " + info.roles);

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

			User creatingUser = ((BaseObjectCreated<?>) targetDomainObject)
					.getCreator();
			// System.out.println("creatingUser " + creatingUser);

			/* non-admin users may not modify objects which they did not create */
			if (creatingUser == null) {
				return false;
			}
			/* non-admin users may not modify objects which they did not create */
			if (!creatingUser.getId().equals(info.user.getId())) {
				return false;
			}
		}

		/* all looks good */
		return true;
	}

	/**
	 * Implement {@link PermissionEvaluator}.hasPermission(...)
	 */
	@Override
	public boolean hasPermission(Authentication authentication,
			Serializable targetId, String targetType, Object permission) {
		@SuppressWarnings("unchecked")
		Object entity = getRepo(targetType).findOne(targetId);
		return hasPermission(authentication, entity, permission);
	}

	/**
	 * Return the user which makes the request in the current servlet request
	 * context.
	 * 
	 * @return
	 */
	public User getRequestingUser() {
		return AuthFilter.getRequestingUser(req, repoUser);
	}

	/* PRIVATE HELPER METHODS */

	@SuppressWarnings("rawtypes")
	private BaseObjectRepository getRepo(String target) {
		if (Target.DEVICE_TYPE.equals(target))
			return repoDevType;
		throw new IllegalArgumentException(target);
	}

}
