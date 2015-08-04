package io.riots.core.auth;

import io.riots.api.services.users.AuthInfo;
import io.riots.api.services.users.AuthInfoExternal;
import io.riots.api.services.users.AuthToken;
import io.riots.api.services.users.UsersService;
import io.riots.core.clients.ServiceClientFactory;

import org.apache.log4j.Logger;

/**
 * @author whummer
 */
public class AuthNetworkRiots extends AuthNetwork {

	private static final Logger LOG = Logger.getLogger(AuthNetworkRiots.class);
	private ServiceClientFactory clientFactory = null;

	public AuthInfo verifyAccessToken(String token) {

		AuthInfo newInfo = new AuthInfo();
		try {
            UsersService users = clientFactory.getUsersServiceClient(AuthHeaders.INTERNAL_CALL);
            AuthToken authToken = new AuthToken();
            authToken.network = "riots";
            authToken.token = token;
            AuthInfoExternal verifiedInfo = users.getInfoForAuthToken(authToken);
            newInfo.copyFrom(verifiedInfo);
        } catch (Exception e) {
            LOG.warn("Unable to process auth headers for auth token '" + token + "'", e);
            return null;
        }

		return newInfo;
	}

	public void setClientFactory(ServiceClientFactory clientFactory) {
		this.clientFactory  = clientFactory;
	}

}
