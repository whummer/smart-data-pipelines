package io.riots.core.auth;

import io.riots.core.logging.Markers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This filter allows cross-origin resource sharing (CORS) 
 * for our REST Web services.
 *
 * @author Waldemar Hummer
 */
public class CORSFilter implements Filter {

	static final Logger log = LoggerFactory.getLogger(CORSFilter.class);

	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
		HttpServletResponse response = (HttpServletResponse) res;
		HttpServletRequest request = (HttpServletRequest) req;
		if (!isGatewayForwarded(request)) {
			log.debug(Markers.AUTH, "Request from non-gateway source, adding CORS headers");
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.setHeader("Access-Control-Allow-Headers",
					"origin, content-type, accept, authorization, x-requested-with, " +
							AuthHeaders.HEADER_AUTH_TOKEN + ", " + AuthHeaders.HEADER_AUTH_NETWORK);
			response.setHeader("Access-Control-Allow-Credentials", "true");
			response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
			response.setHeader("Access-Control-Max-Age", "1209600");
			response.setHeader("Access-Control-Expose-Headers", "Location");
			response.setStatus(HttpServletResponse.SC_OK);
		} else {
			log.debug(Markers.AUTH, "Request from gateway source, skipping CORS headers");
		}

		chain.doFilter(req, res);
//		System.out.println("done. " + response.getStatus() + " - " + request.getMethod() + " - " + request.getRequestURI() + " - " + AuthHeaders.getHeaders(request));

	}

	private boolean isGatewayForwarded(HttpServletRequest request) {
		return request.getHeader(AuthHeaders.HEADER_INTERNAL_CALL) != null;
	}

	public void init(FilterConfig filterConfig) {}
	public void destroy() {}

}
