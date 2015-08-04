package io.riots.core.auth;

import io.riots.api.services.users.AuthInfo;
import io.riots.core.clients.ServiceClientFactory;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * This filter enforces authentication and authorization.
 * Authentication tokens are validated, and access to protected
 * resources (both static files and services) is restricted.
 *
 * @author Waldemar Hummer
 */
@Component
public class AuthFilterWebsocket extends AuthFilterBase {

	@Autowired
	ServiceClientFactory clientFactory;

	@Override
	protected boolean doFilter(ServletRequest req, ServletResponse res) {
        HttpServletRequest request = (HttpServletRequest) req;

		/* get auth info from Websocket headers (encoded in protocol string) */
        String wsHeader = request.getHeader(AuthHeaders.HEADER_WS_PROTOCOL);
        if (wsHeader != null) {
        	return super.doFilter(req, res);
        }

        return true;
	}

	@Override
	void setAuthInfoHeaders(HttpServletRequest request, AuthInfo authInfo) {
		super.setAuthInfoHeaders(request, authInfo);
	}

	@Override
	protected ServiceClientFactory getClientFactory() {
		return clientFactory;
	}

}
