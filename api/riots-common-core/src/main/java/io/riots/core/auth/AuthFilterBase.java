package io.riots.core.auth;

import io.riots.core.auth.AuthHeaders.AuthInfo;
import io.riots.core.auth.AuthHeaders.AuthRequestInfo;
import io.riots.core.service.ServiceClientFactory;
import io.riots.services.apps.Application;
import io.riots.services.users.Role;
import io.riots.services.users.User;

import java.io.IOException;
import java.net.HttpCookie;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

/**
 * This filter enforces authentication and authorization.
 * Authentication tokens are validated, and access to protected
 * resources (both static files and services) is restricted.
 *
 * This class is abstract and has no @Component annotation, on purpose. 
 * Subclasses should extend this class (possibly with additional functionality
 * such as adding Zuul proxy forwarding headers) and use @Component there.
 *
 * @author Waldemar Hummer
 */
public abstract class AuthFilterBase implements Filter, AuthenticationEntryPoint, AuthenticationProvider {

	/* CONSTANTS */

    protected static final long EXPIRY_TIMEOUT_MS = 1000 * 60 * 30; /* 30 minutes token timeout */
    protected static final long INACTIVITY_TIMEOUT_MS = 1000 * 60 * 10; /* 10 minutes inactivity timeout */
    private static final Logger LOG = Logger.getLogger(AuthFilterBase.class);
    private static final Map<String, AuthInfo> tokens = new ConcurrentHashMap<String, AuthInfo>();

    /**
     * if auth info is encoded in Websocket header, use this delimiter
     */
    public static final String AUTHINFO_DELIMITER = "~";
    /**
     * use this field to disable the auth mechanism for testing.
     * Simply set to true in the setup method of your integration tests.
     */
    public static boolean DISABLE_AUTH = false;
    /**
     * Mapping user to roles.
     */
    private static final List<UserRoleMapping> userRoleMappings = new LinkedList<UserRoleMapping>();
    /**
     * Mapping resource to required roles.
     */
    private static final Map<String,String> requiredRoleForResources = new HashMap<>();

    public static class UserRoleMapping {
        String userPattern;
        String role;

        public UserRoleMapping(String userPattern, String role) {
            this.userPattern = userPattern;
            this.role = role;
        }
    }

    /* TODO: put into config file */
    private static final List<String> protectedResources = Arrays.asList(
            "^/.*$"
    );
    /* TODO: put into config file */
    private static final List<String> unprotectedResources = Arrays.asList(
            "^/app/*$",
            "^/bower_components/.*$",
            "^(/app)?/index\\.html$",
            "^(/app)?/views/dialogs\\.html$",
            "^(/app)?/views/login\\.html$",
            "^(/app)?/views/login_result\\.html$",
            "^(/app)?/styles/.*\\.css$",
            "^(/app)?/config\\.js$",
            "^(/app)?/config(\\.requirejs)?\\.js$",
            "^(/app)?/img/.*\\.gif$",
            "^(/app)?/img/.*\\.png$",
            "^(/app)?/img/.*\\.jpeg$",
            "^(/app)?/api/riots-api\\.js$",
            "^(/app)?/(riots\\.)?favicon\\.ico$",
            "^/models/.*$",
            "^/examples/.*$",
            "^/connect/*.*$",
            "^/$",

            "^(/app)?/scripts/app\\.js$",
            "^(/app)?/scripts/build/.*$",
            "^(/app)?/scripts/ext/.*$",
            "^(/app)?/scripts/controllers/.*\\.js$",
            "^(/app)?/scripts/modules/.*\\.js$",
            "^(/app)?/scripts/routes\\.js$",
            "^(/app)?/scripts/init\\.js$",

            /* Demo URLs */
            "^/demo/*.*$",
            "^/golfcars.*$",

            /* allow access to file service */
            "^(/api/v.)?/files.*$"

    );
    public static final String ADMIN_USER_1 = "hummer@infosys.tuwien.ac.at";
    static {
        /* TODO: put into config file or database */
        userRoleMappings.add(new UserRoleMapping(ADMIN_USER_1, Role.ROLE_ADMIN));
        userRoleMappings.add(new UserRoleMapping("dev@riox.io", Role.ROLE_ADMIN));
        userRoleMappings.add(new UserRoleMapping("olzn23@gmail.com", Role.ROLE_ADMIN));
        userRoleMappings.add(new UserRoleMapping(".*", Role.ROLE_USER));
    }
    static {
        /* TODO: put into config file or database */
    	requiredRoleForResources.put("^(/app)?/views/admin.*$", Role.ROLE_ADMIN);
    }

    /**
     * Implement {@link Filter}.doFilter(...)
     */
    @Override
    public void doFilter(ServletRequest req, ServletResponse res,
                         FilterChain chain) throws IOException, ServletException {
        boolean allowed = doFilter(req, res);
        if (allowed) {
        	chain.doFilter(req, res);
        }
    }

    /**
     * Implement {@link AuthenticationEntryPoint}.commence(...)
     */
    @Override
    public void commence(final HttpServletRequest request,
                         final HttpServletResponse response,
                         final AuthenticationException authException) throws IOException {
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
        }
        doFilter(request, response);
    }

    /**
     * Implement {@link AuthenticationProvider}.authenticate(...)
     */
    @Override
    public Authentication authenticate(Authentication authentication)
            throws AuthenticationException {
        return authentication;
    }

    /**
     * Implement {@link AuthenticationProvider}.supports(...)
     */
    @Override
    public boolean supports(Class<?> authentication) {
        return true;
    }

	/* ACTUAL BUSINESS LOGIC BELOW */

    protected boolean doFilter(ServletRequest req, ServletResponse res) {
        cleanupTokens();

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        if (DISABLE_AUTH) {
			/* disable auth checks for testing */
            return true;
        }

        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
			/* always allow OPTIONS requests */
            return true;
        }

        /* 
         * Get the auth info from the incoming request, via either of: 
         *  - Websocket protocol header
         *  - Cookie-encoded HTTP headers
         *  - Custom HTTP headers
         */
        AuthRequestInfo requestInfo = new AuthRequestInfo();
        if (request.getHeader(AuthHeaders.HEADER_WS_PROTOCOL) != null) {
        	requestInfo = getAuthFromWebsocket(request, response);
        }
        if (!requestInfo.isFilledOut()) {
        	requestInfo = getAuthFromCookie(request, response);
        }
        if (!requestInfo.isFilledOut()) {
        	requestInfo = getAuthFromCustomHeaders(request, response);
        }

        /* 
         * determine whether authorization is 
         * required for this resource/request 
         */
        String uri = request.getRequestURI();
        if (isProtected(uri) && !isUnprotected(uri)) {

            /* 
             * if auth info is incomplete -> deny access! 
             */
        	if(!requestInfo.isFilledOut()) {
        		LOG.info("Incomplete or no authentication information received.");
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return false;
        	}
        	
        	//System.out.println("Access protected resource with auth info: " + requestInfo);

            /*
             * attempt to get token from cache
             */
        	String tokenID = requestInfo.getTokenKey();
            AuthInfo info = tokens.get(tokenID);
            boolean doVerify = true;
            if (info != null) {
                if (info.isExpired()) {
                    tokens.remove(tokenID);
                } else {
                    doVerify = false;
                }
            }

			/* start the actual verification of the auth credentials */
            if (doVerify) {

                AuthInfo newInfo = null;

                try {
    				if(requestInfo.isOAuthBased()) {

                    	AuthNetwork authNetwork = AuthNetwork.get(requestInfo.network);
    					newInfo = authNetwork.verifyAccessToken(requestInfo.token);
    		            newInfo.accessToken = requestInfo.token;

    		            /* make sure we have a valid userId in the auth info */
		            	User user = findUserByEmail(newInfo.email);
		            	newInfo.userID = user.getId();

	            	} else if(requestInfo.isRiotsBased()) {
	
	            		newInfo = authenticateRiotsApp(requestInfo.userId, requestInfo.appKey);
	
	            	}
                } catch (Exception e) {
                    LOG.warn("Unable to process auth headers (" + requestInfo.network + "): " + e);
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return false;
				}

            	if(newInfo == null) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return false;
            	}

	            newInfo.expiry = new Date(new Date().getTime() + AuthFilterBase.EXPIRY_TIMEOUT_MS);

				/* set user roles in AuthInfo */
	            fillInRoles(newInfo);

				/* store the AuthInfo in a map */
                tokens.put(tokenID, newInfo);
            }

			/* get auth token and set activity timestamp */
            AuthInfo authInfo = tokens.get(tokenID);
            authInfo.setActiveNow();

			/* authentication done, now perform authorization */
            boolean isAuthorized = authorize(uri, authInfo);
            if(!isAuthorized) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return false;
            }

			/* append additional infos to request */
            setAuthInfoHeaders(request, authInfo);
        }

		/* all checks passed, return success */
        return true;
    }

    protected abstract User findUserByEmail(String email);

	private boolean authorize(String uriPath, AuthInfo authInfo) {
    	for(String pattern : requiredRoleForResources.keySet()) {
    		String role = requiredRoleForResources.get(pattern);
    		if(uriPath.matches(pattern)) {
    			if(!authInfo.roles.contains(role)) {
    				LOG.info("Access denied: User '" + authInfo.email + 
    						"' misses required role '" + role + 
    						"' for resource: " + uriPath);
    				return false;
    			}
    		}
    	}
		return true;
	}

    private AuthRequestInfo getAuthFromCustomHeaders(
			HttpServletRequest request, HttpServletResponse response) {
    	final AuthRequestInfo requestInfo = new AuthRequestInfo();
    	requestInfo.network = request.getHeader(AuthHeaders.HEADER_AUTH_NETWORK);
    	requestInfo.token = request.getHeader(AuthHeaders.HEADER_AUTH_TOKEN);
    	requestInfo.userId = request.getHeader(AuthHeaders.HEADER_AUTH_USER_ID);
    	requestInfo.appKey = request.getHeader(AuthHeaders.HEADER_AUTH_APP_KEY);
    	return requestInfo;
	}

	private AuthRequestInfo getAuthFromCookie(
    		HttpServletRequest request, HttpServletResponse response) {
		final AuthRequestInfo info = new AuthRequestInfo();
        String cookie = request.getHeader("cookie");
        if (!isEmpty(cookie)) {
            List<HttpCookie> cookies = parse(cookie);
            for (HttpCookie c : cookies) {
                if (c.getName().equals(AuthHeaders.HEADER_AUTH_NETWORK)) {
                    info.network = c.getValue();
                }
                if (c.getName().equals(AuthHeaders.HEADER_AUTH_TOKEN)) {
                	info.token = c.getValue();
                }
            }
        }
		return info;
	}

	private AuthRequestInfo getAuthFromWebsocket(
    		HttpServletRequest request, HttpServletResponse response) {

    	/* get auth info from Websocket headers (encoded in protocol string) */
        String wsHeader = request.getHeader(AuthHeaders.HEADER_WS_PROTOCOL);
        final AuthRequestInfo info = new AuthRequestInfo();
        if (wsHeader != null) {
            int index = wsHeader.indexOf(AUTHINFO_DELIMITER);
            if (index >= 0) {
            	String firstPart = wsHeader.substring(0, index).trim();
            	String secondPart = wsHeader.substring(index + 1, wsHeader.length()).trim();
            	if(AuthNetwork.NETWORKS.contains(firstPart)) {
            		info.network = firstPart;
                    if (info.token == null) {
                    	info.token = secondPart;
                    }
            	} else {
            		/* interpret as <userId>:<appKey> token */
            		info.userId = firstPart;
            		info.appKey = secondPart;
            	}
            }
			/* acknowledge the protocol in response headers */
            response.setHeader(AuthHeaders.HEADER_WS_PROTOCOL,
            		request.getHeader(AuthHeaders.HEADER_WS_PROTOCOL));
        }
        return info;
    }

    protected abstract AuthInfo authenticateRiotsApp(String userId, String appId);

    /**
     * Returns a valid AuthInfo token for the given parameters, 
     * or null if the authentication fails.
     */
	protected AuthInfo authenticateRiotsApp(ServiceClientFactory clientFactory, String userId, String appKey) {
		try {
			User user = clientFactory.getUsersServiceClient(AuthHeaders.INTERNAL_CALL).findByID(userId);
			if(user == null || !userId.equals(user.getId())) {
				return null;
			}
			Application app = clientFactory.getApplicationsServiceClient().retrieveByAppKey(appKey);
			if(app == null || !appKey.equals(app.getAppKey())) {
				return null;
			}
			AuthInfo info = new AuthInfo();
			if(app.isAuthorized(user)) {
				info.userID = userId;
				info.email = user.getEmail();
				return info;
			}
		} catch (Exception e) {
			LOG.info("Unable to authorize user/app: " + userId + "/" + appKey, e);
		}
		/* deny access */
		return null;
	}

	void setAuthInfoHeaders(HttpServletRequest request, AuthInfo authInfo) {
    	/* append additional infos to request */
        request.setAttribute(AuthHeaders.HEADER_AUTH_EMAIL, authInfo.email);
        request.setAttribute(AuthHeaders.HEADER_AUTH_USER_ID, authInfo.userID);
    }
	static void readAuthInfoHeaders(HttpServletRequest request, AuthInfo authInfo) {
    	/* append additional infos to request */
		authInfo.email = request.getHeader(AuthHeaders.HEADER_AUTH_EMAIL);
		authInfo.userID = request.getHeader(AuthHeaders.HEADER_AUTH_USER_ID);
    }

	/* HELPER METHODS */

	protected static void fillInRoles(AuthInfo info) {
    	if(info.isInternalCall()) {
    		/* add all roles if this is an internal call */
    		info.addRoles(Role.ROLES);
    		return;
    	}
    	if(info.email == null)
    		return;
    	for (UserRoleMapping m : userRoleMappings) {
            if (info.email.matches(m.userPattern)) {
            	info.addRole(m.role);
            }
        }
    }

    private List<HttpCookie> parse(String cookieString) {
        List<HttpCookie> result = new LinkedList<HttpCookie>();
        for (String cookie : cookieString.split("\\s*;\\s*")) {
            if (cookie.contains("=")) {
                String[] parts = cookie.split("\\s*=\\s*");
                if (parts.length == 2) {
                    result.add(new HttpCookie(parts[0], parts[1]));
                }
            } else {
                LOG.warn("Cannot parse cookie string: '" + cookie + "'");
            }
        }
        return result;
    }

    private boolean isEmpty(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static void cleanupTokens() {
    	cleanupTokens(false);
    }
    private static void cleanupTokens(boolean force) {
        // only do this from time to time (TODO: better approach?)
        if (!force && Math.random() < 0.95) {
            return;
        }
        synchronized (tokens) {
            for (String id : new HashSet<String>(tokens.keySet())) {
                AuthInfo token = tokens.get(id);
                if (token.expiry.before(new Date())) {
                    tokens.remove(id);
                }
            }
        }
        LOG.debug("Cleaned up. Remaining tokens: " + tokens.size());
    }

    private boolean isUnprotected(String path) {
    	boolean result = matchesAny(path, unprotectedResources);
    	return result;
    }

    private boolean isProtected(String path) {
        return matchesAny(path, protectedResources);
    }

    private boolean matchesAny(String path, List<String> list) {
        for (String regex : list) {
            if (path.matches(regex)) {
                return true;
            }
        }
        return false;
    }

    public static long getOnlineUsersCount() {
    	/* TODO maybe cache this number for performance reasons */
    	long count = 0;
    	for(AuthInfo i : tokens.values()) {
    		if(i.isCurrentlyActive()) {
    			count ++;
    		}
    	}
        return count;
    }

    public void init(FilterConfig filterConfig) {
    }

    public void destroy() {
    }

}
