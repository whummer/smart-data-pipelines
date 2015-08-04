package io.riots.core.auth;

import io.riots.api.services.users.AuthInfo;
import io.riots.api.services.users.User;
import io.riots.api.services.users.UsersService;
import io.riots.core.clients.ServiceClientFactory;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
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
    public static final String HEADER_INTERNAL_CALL = "riots-internal";
    public static final String HEADER_WS_PROTOCOL = "Sec-WebSocket-Protocol";

    public static final Map<String,String> INTERNAL_CALL = new HashMap<>();
//			new MapBuilder<String,String>().put(AuthHeaders.HEADER_INTERNAL_CALL, "true").map();

    private static final Logger LOG = Logger.getLogger(AuthHeaders.class);

    @Autowired
    private ServiceClientFactory clientFactory;

    public AuthHeaders() {
        INTERNAL_CALL.put(AuthHeaders.HEADER_INTERNAL_CALL, "true");
    }

    /**
     * Thread local variable containing the AuthInfo  
     * associated with the current request thread.
     */
    public static final ThreadLocal<AtomicReference<AuthInfo>> THREAD_AUTH_INFO =
        new ThreadLocal<AtomicReference<AuthInfo>>() {
            @Override
            protected AtomicReference<AuthInfo> initialValue() {
                return new AtomicReference<AuthInfo>(new AuthInfo());
        }
    };
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

        /**
         * Returns a hash key which identifies this token. Used
         * as key for the hashmap which caches auth tokens.
         * @return
         */
        String getTokenHashKey() {
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
     * Construct requesting user from given information.
     */
    public static synchronized User getRequestingUser(String userEmail,
                                   String userID, UsersService usersService) {
		/* find existing user */
        User existing = null;
        if (!StringUtils.isEmpty(userEmail)) {
            existing = usersService.findByEmail(userEmail);
        } else if(!StringUtils.isEmpty(userID)) {
        	existing = usersService.findByID(userID);
        }
        LOG.info("INFO: Got requesting user: " + userEmail + " - " + userID + " - " + existing);
        return existing;
    }

    public synchronized User getRequestingUser(HttpServletRequest req) {
    	UsersService users = clientFactory.getUsersServiceClient(AuthHeaders.INTERNAL_CALL);
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
