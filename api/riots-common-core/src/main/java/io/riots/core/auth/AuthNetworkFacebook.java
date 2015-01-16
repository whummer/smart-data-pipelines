package io.riots.core.auth;

import io.riots.core.auth.AuthHeaders.AuthInfo;

import java.net.URL;
import java.util.Map;

import org.apache.cxf.helpers.IOUtils;
import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * @author whummer
 */
public class AuthNetworkFacebook extends AuthNetwork {

	private static final Logger LOG = Logger.getLogger(AuthNetworkFacebook.class);
    private static final ObjectMapper JSON = new ObjectMapper();

	public AuthInfo verifyAccessToken(String token) {

		AuthInfo newInfo = new AuthInfo();
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
            newInfo.userName = (String) json.get("name");
            newInfo.email = (String) json.get("email");
        } catch (Exception e) {
            LOG.warn("Unable to process auth headers: " + e);
            return null;
        }

		return newInfo;
	}

}
