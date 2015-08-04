package io.riots.core.auth;

import io.riots.api.services.users.AuthInfo;
import io.riots.core.clients.ServiceClientFactory;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * This filter reads the authentication headers of the
 * incoming request and sets Spring security 
 * ({@link Authentication}) credentials.
 *
 * @author Waldemar Hummer
 */
@Component
public class AuthCredentialsSetter implements Filter {

	@Autowired
	ServiceClientFactory clientFactory;

	@Override
	public void doFilter(ServletRequest req, ServletResponse res,
			FilterChain chain) throws IOException, ServletException {

		HttpServletRequest httpReq = (HttpServletRequest)req;
		HttpServletResponse httpRes = (HttpServletResponse)res;

		/* get auth info from headers */
		AuthInfo info = AuthHeaders.THREAD_AUTH_INFO.get().get();
		info.setInternalCall(isInternalCall(httpReq));
		AuthFilterBase.readAuthInfoHeaders(httpReq, info);

		/* set user roles in AuthInfo */
		AuthFilterBase.fillInRoles(info);

		/* set the Spring security context */
		UsernamePasswordAuthenticationToken springSecToken = new UsernamePasswordAuthenticationToken(
				info.getName(), info.getAccessToken(), info.getRolesAsGrantedAuthorities());
		springSecToken.setDetails(info);
		SecurityContextHolder.getContext().setAuthentication(springSecToken);

		/* continue request */
		try {
			chain.doFilter(req, res);
		} catch (Throwable e) {
			String msg = e.getMessage();
			if(msg != null && msg.contains("Access is denied")) {
				httpRes.setStatus(HttpServletResponse.SC_FORBIDDEN);
				return;
			}
		}
	}
	
	private boolean isInternalCall(HttpServletRequest httpReq) {
		return !StringUtils.isEmpty(httpReq.getHeader(AuthHeaders.HEADER_INTERNAL_CALL));
	}

	@Override
	public void destroy() {
	}

	@Override
	public void init(FilterConfig arg0) throws ServletException {
	}

}
