package io.riots.api.services.gateway;

import io.riots.core.util.JSONUtil;
import io.riots.core.auth.AuthFilterBase;
import io.riots.api.services.statistics.GatewayStatsService;
import io.riots.api.services.statistics.GatewayStatsService.GatewayStats;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.MediaType;

/**
 * Simple servlet filter used to report some stats about 
 * the gateway, e.g., currently active users.
 * 
 * This class implements the functionality of {@link GatewayStatsService}, 
 * but in order to not interfere with Zuul routing, it is implemented as a 
 * servlet filter and not as a regular REST clients.
 * 
 * @author whummer
 */
public class GatewayStatsFilter implements Filter {
	private String path;
	public GatewayStatsFilter(String path) {
		this.path = path;
	}
	public void doFilter(ServletRequest req, ServletResponse res,
			FilterChain chain) throws IOException, ServletException {
		if(req instanceof HttpServletRequest) {
			HttpServletRequest r = (HttpServletRequest)req;
			if(r.getRequestURI().matches(path)) {
				GatewayStats s = new GatewayStats();
				s.getUsers().setOnline(AuthFilterBase.getOnlineUsersCount());
				String result = JSONUtil.toJSON(s);
				res.setContentType(MediaType.APPLICATION_JSON);
				res.getOutputStream().write(result.getBytes());
				return;
			}
		}
		chain.doFilter(req, res);
	}
	public void init(FilterConfig arg0) throws ServletException {}
	public void destroy() { }
}
