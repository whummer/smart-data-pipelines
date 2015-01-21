package io.riots.core.auth;

import io.riots.core.clients.ServiceClientFactory;
import io.riots.api.services.users.UsersService;
import io.riots.api.services.users.Role;
import io.riots.api.services.users.User;

import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
        boolean internalCall;
        final Set<String> roles = new HashSet<String>();
        final Set<GrantedAuthority> rolesAsGrantedAuthorities = new HashSet<GrantedAuthority>();

		public void addRole(String role) {
			roles.add(role);
        	rolesAsGrantedAuthorities.add(
                    new SimpleGrantedAuthority(role));
		}
		public void addRoles(String ... roles) {
			for(String role : roles)
				addRole(role);
		}

        public boolean isExpired() {
            return expiry.before(new Date());
        }
		public void setActiveNow() {
			lastActiveTime = System.currentTimeMillis();
		}
		public boolean isInternalCall() {
			return internalCall;
		}
		public boolean isCurrentlyActive() {
			return (System.currentTimeMillis() - lastActiveTime) 
					< AuthFilterBase.INACTIVITY_TIMEOUT_MS;
		}
		public String getUserID() {
			return userID;
		}
		public void setUserID(String userID) {
			this.userID = userID;
		}
		public String getEmail() {
			return email;
		}
		public void setEmail(String email) {
			this.email = email;
		}
		public Set<String> getRoles() {
			return roles;
		}
		public boolean isAdmin() {
			return hasRole(Role.ROLE_ADMIN);
		}
		public boolean hasRole(String role) {
			return roles.contains(role);
		}

		@Override
		public String toString() {
			return "AuthInfo [internalCall=" + internalCall + ", userID=" + userID + 
					", userName=" + userName + ", email=" + email + ", roles="
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
        } else if (!StringUtils.isEmpty(userEmail)) {
            existing = usersService.findByEmail(userEmail);
        }
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
