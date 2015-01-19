package io.riots.core.auth;

import io.riots.core.auth.AuthHeaders.AuthInfo;
import io.riots.core.model.ModelCache;
import io.riots.core.clients.ServiceClientFactory;
import io.riots.api.services.users.UsersService;
import io.riots.api.services.users.User;
import io.riots.api.services.users.UserAction;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.netflix.zuul.context.RequestContext;

/**
 * This filter enforces authentication and authorization.
 * Authentication tokens are validated, and access to protected
 * resources (both static files and services) is restricted.
 *
 * @author Waldemar Hummer
 */
@Component
public class AuthFilterZuul extends AuthFilterBase {

	private static final Logger LOG = Logger.getLogger(AuthFilterZuul.class);

	@Autowired
	ServiceClientFactory clientFactory;

	@Override
	public void doFilter(ServletRequest req, ServletResponse res,
			FilterChain chain) throws IOException, ServletException {
		super.doFilter(req, res, chain);

		try {
			/* log user action */
			UsersService s = getCachedUsersServiceClient();
			AuthInfo info = AuthHeaders.THREAD_AUTH_INFO.get().get();
			String path = ((HttpServletRequest)req).getRequestURI();
			long outLength = 0; // TODO set out length
			if(path != null && path.matches("^/api/v[0-9]+.*")) {
				UserAction action = new UserAction(info.userID, path,
						req.getContentLengthLong(), outLength);
				s.postUserAction(action);
			}
		} catch (Exception e) {
			LOG.warn("Unable to persist user action.", e);
		}

	}

	@Override
	void setAuthInfoHeaders(HttpServletRequest request, AuthInfo authInfo) {
		super.setAuthInfoHeaders(request, authInfo);

		/* make sure that we do not let this header pass through! 
		 * This prevents external request pretending they are internal calls. */
        request.setAttribute(AuthHeaders.HEADER_INTERNAL_CALL, "");

        /* append headers to zuul request */
        RequestContext context = RequestContext.getCurrentContext();
		if(context != null) {
			context.getZuulRequestHeaders().put(AuthHeaders.HEADER_AUTH_EMAIL, authInfo.email);
			context.getZuulRequestHeaders().put(AuthHeaders.HEADER_AUTH_USER_ID, authInfo.userID);
			context.getZuulRequestHeaders().put(AuthHeaders.HEADER_INTERNAL_CALL, "");
		}
	}

	@Override
	protected AuthInfo authenticateRiotsApp(String userId, String appId) {
		return authenticateRiotsApp(clientFactory, userId, appId);
	}

	@Override
	protected User findUserByEmail(String email) {
		User user = (User) ModelCache.USERS.get(email);
		if(user != null) {
			return user;
		}
		user = clientFactory.getUsersServiceClient(AuthHeaders.INTERNAL_CALL).findByEmail(email);
		ModelCache.USERS.put(email, user);
		return user;
	}
	
	/* HELPER METHODS */

	private synchronized UsersService getCachedUsersServiceClient() {
		UsersService s = null;
		s = (UsersService) ModelCache.SERVICE_CLIENTS.get(UsersService.class);
		if(s == null) {
			s = clientFactory.getUsersServiceClient(AuthHeaders.INTERNAL_CALL);
			ModelCache.SERVICE_CLIENTS.put(UsersService.class, s);
		}
		return s;
	}

}
