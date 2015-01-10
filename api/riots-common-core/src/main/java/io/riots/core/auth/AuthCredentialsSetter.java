package io.riots.core.auth;

import io.riots.core.auth.AuthHeaders.AuthInfo;
import io.riots.core.service.ServiceClientFactory;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * This filter enforces authentication and authorization. Authentication tokens
 * are validated, and access to protected resources (both static files and
 * services) is restricted.
 *
 * @author Waldemar Hummer
 */
@Component
public class AuthCredentialsSetter implements Filter
	//, AuthenticationProvider 
{

	@Autowired
	ServiceClientFactory clientFactory;

	@Override
	public void doFilter(ServletRequest req, ServletResponse res,
			FilterChain chain) throws IOException, ServletException {

		/* get auth info from headers */
		AuthInfo info = new AuthInfo();
		AuthFilterBase.readAuthInfoHeaders((HttpServletRequest)req, info);

		/* set user roles in AuthInfo */
		AuthFilterBase.fillInRoles(info);

		/* set the Spring security context */
		UsernamePasswordAuthenticationToken springSecToken = new UsernamePasswordAuthenticationToken(
				info.userName, info.accessToken, info.rolesAsGrantedAuthorities);
		springSecToken.setDetails(info);
		SecurityContextHolder.getContext().setAuthentication(springSecToken);
		
		/* continue request */
		chain.doFilter(req, res);
	}

	/**
	 * Implement {@link AuthenticationProvider}.authenticate(...)
	 */
//	@Override
//	public Authentication authenticate(Authentication authentication)
//			throws AuthenticationException {
//		return authentication;
//	}
//
//	/**
//	 * Implement {@link AuthenticationProvider}.supports(...)
//	 */
//	@Override
//	public boolean supports(Class<?> authentication) {
//		return true;
//	}

	@Override
	public void destroy() {
	}

	@Override
	public void init(FilterConfig arg0) throws ServletException {
	}

}
