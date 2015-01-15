package io.riots.core.auth;

import io.riots.core.auth.AuthHeaders.AuthInfo;

import java.net.URL;
import java.util.List;
import java.util.Map;

import org.apache.cxf.helpers.IOUtils;
import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * @author whummer
 */
public class AuthNetworkGoogle extends AuthNetwork {

	private static final Logger LOG = Logger.getLogger(AuthNetworkGoogle.class);
    private static final ObjectMapper JSON = new ObjectMapper();

	public AuthInfo verifyAccessToken(String token) {

		AuthInfo newInfo = new AuthInfo();
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
            newInfo.userName = (String) json.get("displayName");
            @SuppressWarnings("unchecked")
            List<Map<String, String>> emails = (List<Map<String, String>>) json.get("emails");
            newInfo.email = emails.get(0).get("value");
        } catch (Exception e) {
            LOG.warn("Unable to process auth headers: " + e);
            return null;
        }

		return newInfo;
	}

}
