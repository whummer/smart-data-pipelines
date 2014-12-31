package io.riots.core.auth;

import io.riots.core.auth.AuthHeaders.AuthInfo;
import io.riots.core.service.ServiceClientFactory;

import javax.servlet.http.HttpServletRequest;

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

	@Autowired
	ServiceClientFactory clientFactory;

	@Override
	void setAuthInfoHeaders(HttpServletRequest request, AuthInfo authInfo) {
		super.setAuthInfoHeaders(request, authInfo);

        /* append headers to zuul request */
        RequestContext context = RequestContext.getCurrentContext();
		if(context != null) {
			context.getZuulRequestHeaders().put(AuthHeaders.HEADER_AUTH_EMAIL, authInfo.email);
			context.getZuulRequestHeaders().put(AuthHeaders.HEADER_AUTH_USERNAME, authInfo.userName);
		}
	}

	@Override
	protected boolean authenticateRiotsApp(String userId, String appId) {
		return authenticateRiotsApp(clientFactory, userId, appId);
	}

}
