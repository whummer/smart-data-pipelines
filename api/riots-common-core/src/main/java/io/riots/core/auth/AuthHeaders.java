package io.riots.core.auth;

import io.riots.core.service.IUsers;
import io.riots.core.service.ServiceClientFactory;
import io.riots.services.users.User;

import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.security.core.GrantedAuthority;

/**
 * Retrieve information from authentication headers sent along with 
 * request invocation messages.
 * @author whummer
 */
public class AuthHeaders {

    public static final String HEADER_AUTH_NETWORK = "riots-auth-network";
    public static final String HEADER_AUTH_TOKEN = "riots-auth-token";
    public static final String HEADER_AUTH_EMAIL = "riots-auth-email";
    public static final String HEADER_AUTH_USERNAME = "riots-auth-username";
    public static final String HEADER_WS_PROTOCOL = "Sec-WebSocket-Protocol";

    private static final Logger LOG = Logger.getLogger(AuthHeaders.class);

    /**
     * Class which holds authentication information.
     */
    public static class AuthInfo {
        String accessToken;
        Date expiry;
        String userID;
        String userName;
        String email;
        User user;
        final List<String> roles = new LinkedList<String>();
        final List<GrantedAuthority> rolesAsGrantedAuthorities = new LinkedList<GrantedAuthority>();

        boolean isExpired() {
            return expiry.before(new Date());
        }
    }

    /**
     * Construct requesting user from given information.
     */
    public static synchronized User getRequestingUser(String userEmail,
                                   String userName, IUsers usersService) {

        System.out.println("INFO: Get requesting user: " + userEmail + " - " + userName);
        if (userEmail == null) {
            return null;
        }
		/* TODO make find/create transactionally safe */
		/* find existing user */
        System.out.println(usersService);
        LOG.info("INFO: Get requesting user: " + userEmail + " - " + userName);
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
        System.out.println(getHeaders(req));
        return getRequestingUser(userEmail, userName, usersService);
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

}
