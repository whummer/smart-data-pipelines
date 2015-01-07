package io.riots.core.auth;

import io.riots.core.service.ServiceClientFactory;
import io.riots.services.UsersService;
import io.riots.services.users.User;

import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

/**
 * Retrieve information from authentication headers sent along with
 * request invocation messages.
 * @author whummer
 */
@Component
public class AuthHeaders {

    public static final String HEADER_AUTH_NETWORK = "riots-auth-network";
    public static final String HEADER_AUTH_TOKEN = "riots-auth-token";
    public static final String HEADER_AUTH_EMAIL = "riots-auth-email";
    public static final String HEADER_AUTH_USER_ID = "riots-auth-user-id";
    public static final String HEADER_AUTH_APP_KEY = "riots-auth-app-key";
    public static final String HEADER_WS_PROTOCOL = "Sec-WebSocket-Protocol";

    private static final Logger LOG = Logger.getLogger(AuthHeaders.class);

    @Autowired
    private ServiceClientFactory clientFactory;

    /**
     * Class which holds authentication information.
     */
    public static class AuthRequestInfo {
        /* option 1: OAuth authentication based on email & access token */
        String network;
        String token;
        /* option 2: authentication based on riots userId and appKey */
        String userId;
        String appKey;

        boolean isOAuthBased() {
        	return !StringUtils.isEmpty(network) && !StringUtils.isEmpty(token);
        }
        boolean isRiotsBased() {
        	return !StringUtils.isEmpty(userId) && !StringUtils.isEmpty(appKey);
        }
        boolean isFilledOut() {
        	return isOAuthBased() || isRiotsBased();
        }

        String getTokenKey() {
        	if(isOAuthBased()) {
        		return token + "@" + network;
        	} else if(isRiotsBased()) {
        		return userId + "@" + appKey;
        	}
        	return null;
        }

		@Override
		public String toString() {
			return "AuthRequestInfo [network=" + network + ", token=" + token
					+ ", userId=" + userId + ", appKey=" + appKey + "]";
		}
    }

    /**
     * Class which holds authentication information.
     */
    public static class AuthInfo {
        String accessToken;
        Date expiry;
        long lastActiveTime;
        String userID;
        String userName;
        String email;
        User user;
        final List<String> roles = new LinkedList<String>();
        final List<GrantedAuthority> rolesAsGrantedAuthorities = new LinkedList<GrantedAuthority>();

        public boolean isExpired() {
            return expiry.before(new Date());
        }
		public void setActiveNow() {
			lastActiveTime = System.currentTimeMillis();
		}
		public boolean isCurrentlyActive() {
			return (System.currentTimeMillis() - lastActiveTime) 
					< AuthFilterBase.INACTIVITY_TIMEOUT_MS;
		}
        
		@Override
		public String toString() {
			return "AuthInfo [userID=" + userID + ", userName=" + userName
					+ ", email=" + email + ", user=" + user + ", roles="
					+ roles + ", accessToken=" + accessToken + ", expiry="
					+ expiry + ", rolesAsGrantedAuthorities="
					+ rolesAsGrantedAuthorities + "]";
		}

    }

    /**
     * Construct requesting user from given information.
     */
    public static synchronized User getRequestingUser(String userEmail,
                                   String userID, UsersService usersService) {
		/* find existing user */
        LOG.info("INFO: Get requesting user: " + userEmail + " - " + userID);
        User existing = null;
        if(!StringUtils.isEmpty(userID)) {
        	existing = usersService.findByID(userID);
        }
        if (!StringUtils.isEmpty(userEmail)) {
            existing = usersService.findByEmail(userEmail);
        }
        return existing;
    }

    public synchronized User getRequestingUser(HttpServletRequest req) {
    	UsersService users = clientFactory.getUsersServiceClient();
    	return getRequestingUser(req, users);
    }
    public static synchronized User getRequestingUser(
    		HttpServletRequest req, UsersService usersService) {
        String userEmail = getHeaders(req).get(HEADER_AUTH_EMAIL);
        String userId = getHeaders(req).get(HEADER_AUTH_USER_ID);
        return getRequestingUser(userEmail, userId, usersService);
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
