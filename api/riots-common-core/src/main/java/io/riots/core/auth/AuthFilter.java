package io.riots.core.auth;

import io.riots.core.model.Role;
import io.riots.core.model.User;
import io.riots.core.service.IUsers;
import io.riots.core.service.ServiceClientFactory;

import java.io.IOException;
import java.net.HttpCookie;
import java.net.URL;
import java.util.Arrays;
import java.util.Date;
import java.util.Enumeration;
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

import org.apache.cxf.helpers.IOUtils;
import org.apache.log4j.Logger;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * This filter enforces authentication and authorization.
 * Authentication tokens are validated, and access to protected
 * resources (both static files and services) is restricted.
 *
 * @author Waldemar Hummer
 */
@Component
public class AuthFilter implements Filter, AuthenticationEntryPoint, AuthenticationProvider {

    public static final String HEADER_AUTH_NETWORK = "riots-auth-network";
    public static final String HEADER_AUTH_TOKEN = "riots-auth-token";
    public static final String HEADER_AUTH_EMAIL = "riots-auth-email";
    public static final String HEADER_AUTH_USERNAME = "riots-auth-username";
    public static final String HEADER_WS_PROTOCOL = "Sec-WebSocket-Protocol";
    /**
     * if auth info is encoded in Websocket header, use this delimiter
     */
    public static final String AUTHINFO_DELIMITER = "~";

    /**
     * use this field to disable the auth mechanism for testing.
     * Simply set to true in the setup method of your integration tests.
     */
    public static boolean DISABLE_AUTH = false;

    /* TODO: put into config file */
    private static final List<String> protectedResources = Arrays.asList(
            "^/.*$"
    );
    /* TODO: put into config file */
    private static final List<String> unprotectedResources = Arrays.asList(
            "^/app/$",
            "^/app/index\\.html$",
            "^/app/views/login\\.html$",
            "^/app/views/login_result\\.html$",
            "^/app/styles/.*\\.css$",
            "^/app/config\\.js$",
            "^/app/img/.*\\.gif$",
            "^/app/img/.*\\.png$",
            "^/app/img/.*\\.jpeg$",
            "^/bower_components/.*$",
            "^/models/.*$",
            "^/examples/.*$",
            "^/app/favicon\\.ico$",

            "^/app/scripts/app\\.js$",
            "^/app/scripts/controllers/*.\\.js$",
            "^/app/scripts/modules/.*\\.js$",
            "^/app/scripts/directives/.*\\.js$",
            "^/app/scripts/routes\\.js$",
            "^/app/scripts/init\\.js$"
    );

    private static final List<UserRoleMapping> userRoleMappings = new LinkedList<>();

    public static class UserRoleMapping {
        String userPattern;
        String role;

        public UserRoleMapping(String userPattern, String role) {
            this.userPattern = userPattern;
            this.role = role;
        }
    }

    static {
        /* TODO: put into config file or database */
        userRoleMappings.add(new UserRoleMapping("hummer@infosys.tuwien.ac.at", Role.ROLE_ADMIN));
        userRoleMappings.add(new UserRoleMapping(".*", Role.ROLE_USER));
    }

    private static final Logger LOG = Logger.getLogger(AuthFilter.class);
    private static final ObjectMapper JSON = new ObjectMapper();

    public static class AuthInfo {
        String accessToken;
        Date expiry;
        String userID;
        String userName;
        String email;
        User user;
        final List<String> roles = new LinkedList<>();
        final List<GrantedAuthority> rolesAsGrantedAuthorities = new LinkedList<>();

        boolean isExpired() {
            return expiry.before(new Date());
        }
    }

    private static final Map<String, AuthInfo> tokens = new ConcurrentHashMap<>();
    private static final long EXPIRY_PERIOD_MS = 1000 * 60 * 20; /* 20 minutes token timeout */

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

    private boolean doFilter(ServletRequest req, ServletResponse res) {
        cleanupTokens();

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        if (DISABLE_AUTH) {
			/* disable auth checks for testing */
            return true;
        }

        System.out.println("DEBUG: request type: " + request.getMethod()); // TODO remove
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
			/* always allow OPTIONS requests */
            return true;
        }

        String network = request.getHeader(HEADER_AUTH_NETWORK);
        String token = request.getHeader(HEADER_AUTH_TOKEN);
        if (network == null) {
			/* get auth info from Websocket headers (encoded in protocol string) */
            String wsHeader = request.getHeader(HEADER_WS_PROTOCOL);
            if (wsHeader != null) {
                int index = wsHeader.indexOf(AUTHINFO_DELIMITER);
                if (index >= 0) {
                    network = wsHeader.substring(0, index).trim();
                    if (token == null) {
                        token = wsHeader.substring(index + 1, wsHeader.length()).trim();
                    }
                }
				/* acknowledge the protocol in response headers */
                response.setHeader(HEADER_WS_PROTOCOL, request.getHeader(HEADER_WS_PROTOCOL));
            }
        }

        String cookie = request.getHeader("cookie");
        if (!isEmpty(cookie)) {
            List<HttpCookie> cookies = parse(cookie);
            for (HttpCookie c : cookies) {
                if (c.getName().equals(HEADER_AUTH_NETWORK) && network == null) {
                    network = c.getValue();
                }
                if (c.getName().equals(HEADER_AUTH_TOKEN) && token == null) {
                    token = c.getValue();
                }
            }
        }

        String uri = request.getRequestURI();

        if (isProtected(uri) && !isUnprotected(uri)) {

            if (isEmpty(token)) {
                LOG.info("Invalid token header received: " + token);
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return false;
            }

            AuthInfo info = tokens.get(token);
            boolean doVerify = true;
            if (info != null) {
                if (info.isExpired()) {
                    //LOG.info("Invalid auth token, expired on " + info.expiry + ", now " + new Date());
                    //response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    //return;
                    tokens.remove(token);
                } else {
                    doVerify = false;
                }
            }

            if (doVerify) {
				/* verify credentials */
                System.out.println("Checking credentials: " + uri + " - " + network + " - " + token);

                AuthInfo newInfo = new AuthInfo();
                newInfo.accessToken = token;
                if ("github".equals(network)) {
                    try {
						/* Example:
						 {
						 	"login": "user123",
						 	"name": "Firstname Lastname"
						 	...
						} */
                        String urlPattern = "https://api.github.com/<request>?access_token=" + token;
                        String url1 = urlPattern.replace("<request>", "user");
                        String result1 = IOUtils.readStringFromStream(new URL(url1).openStream());
                        @SuppressWarnings("unchecked")
                        Map<String, Object> json1 = JSON.readValue(result1, Map.class);
                        newInfo.expiry = new Date(new Date().getTime() + EXPIRY_PERIOD_MS);
                        newInfo.userID = (String) json1.get("login");
                        newInfo.userName = (String) json1.get("name");
                        String url2 = urlPattern.replace("<request>", "user/emails");
                        String result2 = IOUtils.readStringFromStream(new URL(url2).openStream());
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> json2 = JSON.readValue(result2, List.class);
                        newInfo.email = (String) json2.get(0).get("email");
                    } catch (Exception e) {
                        LOG.warn("Unable to process auth headers (" + network + "): " + e);
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        return false;
                    }
                } else if ("facebook".equals(network)) {
                    try {
						/* Example:
						 {
							"id": "12345",
						 	"name": "Firstname Lastname",
							"email": "test@test.com",
						 	...
						} */
                        String url = "https://graph.facebook.com/me?access_token=" + token;
                        String result = IOUtils.readStringFromStream(new URL(url).openStream());
                        @SuppressWarnings("unchecked")
                        Map<String, Object> json = JSON.readValue(result, Map.class);
                        newInfo.expiry = new Date(new Date().getTime() + EXPIRY_PERIOD_MS);
                        newInfo.userID = (String) json.get("id");
                        newInfo.userName = (String) json.get("name");
                        newInfo.email = (String) json.get("email");
                    } catch (Exception e) {
                        LOG.warn("Unable to process auth headers (" + network + "): " + e);
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        return false;
                    }
                } else if ("google".equals(network)) {
                    try {
						/* Example:
						 {
							"id": "12345",
						 	"displayName": "Firstname Lastname",
							"emails": [{
								"value": "test@test.com",
								"type": "account"
							}],
						 	...
						} */
                        String url = "https://www.googleapis.com/plus/v1/people/me?access_token=" + token;
                        String result = IOUtils.readStringFromStream(new URL(url).openStream());
                        @SuppressWarnings("unchecked")
                        Map<String, Object> json = JSON.readValue(result, Map.class);
                        newInfo.expiry = new Date(new Date().getTime() + EXPIRY_PERIOD_MS);
                        newInfo.userID = (String) json.get("id");
                        newInfo.userName = (String) json.get("displayName");
                        @SuppressWarnings("unchecked")
                        List<Map<String, String>> emails = (List<Map<String, String>>) json.get("emails");
                        newInfo.email = emails.get(0).get("value");
                    } catch (Exception e) {
                        LOG.warn("Unable to process auth headers (" + network + "): " + e);
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        return false;
                    }
                } else {
                    LOG.warn("Unknown auth network: " + network);
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return false;
                }

				/* set user roles in AuthInfo */
                for (UserRoleMapping m : userRoleMappings) {
                    if (newInfo.email.matches(m.userPattern)) {
                        newInfo.roles.add(m.role);
                        newInfo.rolesAsGrantedAuthorities.add(
                                new SimpleGrantedAuthority(m.role));
                    }
                }

				/* store the AuthInfo in a map */
                tokens.put(token, newInfo);
            }

			/* authentication done, now perform authorization */
            AuthInfo authInfo = tokens.get(token);

			/* append additional infos to request */
            request.setAttribute(HEADER_AUTH_EMAIL, authInfo.email);
            request.setAttribute(HEADER_AUTH_USERNAME, authInfo.userName);

			/* set the Spring security context */
            UsernamePasswordAuthenticationToken springSecToken =
                    new UsernamePasswordAuthenticationToken(
                            authInfo.userName, authInfo.accessToken, authInfo.rolesAsGrantedAuthorities);
            springSecToken.setDetails(authInfo);
            SecurityContextHolder.getContext().setAuthentication(springSecToken);
        }
		/* all tests passed, return success */
        return true;
    }

    public static Map<String, String> getHeaders(HttpServletRequest req) {
        Map<String, String> result = new HashMap<>();
        if (req != null) {
            Enumeration<String> keys = req.getHeaderNames();
            while (keys.hasMoreElements()) {
                String key = keys.nextElement();
                result.put(key, req.getHeader(key));
            }
            keys = req.getAttributeNames();
            while (keys.hasMoreElements()) {
                String key = keys.nextElement();
                result.put(key, "" + req.getAttribute(key));
            }
        }
        return result;
    }

    public static synchronized User getRequestingUser(String userEmail,
                                                      String userName, 
//                                                      UserRepository userRepo
  													  IUsers usersService
  													) {
        if (userEmail == null) {
            return null;
        }
		/* TODO make find/create transactionally safe */
		/* find existing user */
        System.out.println("INFO: Get requesting user: " + userEmail + " - " + userEmail);
        System.out.println(usersService);
        LOG.info("INFO: Get requesting user: " + userEmail + " - " + userEmail);
        User existing = usersService.findByEmail(userEmail);
//        if (existing != null) {
            return existing;
//        }
//		/* create new user */
//        User u = new User();
//        u.setEmail(userEmail);
//        u.setName(userName);
//        u = usersService.save(u);
//        return u;
    }

    public static synchronized User getRequestingUser(HttpServletRequest req) {
    	IUsers users = ServiceClientFactory.getUsersServiceClient();
    	return getRequestingUser(req, users);
    }
    public static synchronized User getRequestingUser(
    		HttpServletRequest req, IUsers usersService) {
        String userEmail = getHeaders(req).get(HEADER_AUTH_EMAIL);
        String userName = getHeaders(req).get(HEADER_AUTH_USERNAME);
        return getRequestingUser(userEmail, userName, usersService);
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
        // only do this from time to time (TODO: better approach?)
        if ((System.currentTimeMillis() / 1000) % 10 != 0) {
            return;
        }
        synchronized (tokens) {
            for (String id : new HashSet<>(tokens.keySet())) {
                AuthInfo token = tokens.get(id);
                if (token.expiry.before(new Date())) {
                    tokens.remove(id);
                }
            }
        }
        LOG.debug("Cleaned up. Remaining tokens: " + tokens.size());
    }

    private boolean isUnprotected(String path) {
        return matchesAny(path, unprotectedResources);
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
        return tokens.size();
    }

    public void init(FilterConfig filterConfig) {
    }

    public void destroy() {
    }
}
