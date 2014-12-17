package io.riots.core.auth;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

/**
 * This filter allows cross-origin resource sharing (CORS) 
 * for our REST Web services.
 *
 * @author Waldemar Hummer
 */
@Component
public class CORSFilter implements Filter {

	static final Logger LOG = Logger.getLogger(CORSFilter.class);

	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
		HttpServletResponse response = (HttpServletResponse) res;
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Headers", 
				"origin, content-type, accept, authorization, x-requested-with, " + 
						AuthFilter.HEADER_AUTH_TOKEN + ", " + AuthFilter.HEADER_AUTH_NETWORK);
		response.setHeader("Access-Control-Allow-Credentials", "true");
		response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
		response.setHeader("Access-Control-Max-Age", "1209600");
		response.setHeader("Access-Control-Expose-Headers", "Location");
		response.setStatus(HttpServletResponse.SC_OK);
		chain.doFilter(req, res);
		/* TODO simulate a latency/delay for testing */
		int simulateDelayMS = 0;
		if(simulateDelayMS > 0) {
			try {
				Thread.sleep(simulateDelayMS);
			} catch (InterruptedException e) { }
		}
	}

	public void init(FilterConfig filterConfig) {}
	public void destroy() {}

}
