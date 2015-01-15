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
public class AuthNetworkGithub extends AuthNetwork {

	private static final Logger LOG = Logger.getLogger(AuthNetworkGithub.class);
    private static final ObjectMapper JSON = new ObjectMapper();

	public AuthInfo verifyAccessToken(String token) {

		AuthInfo newInfo = new AuthInfo();
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
            newInfo.userName = (String) json1.get("name");
            String url2 = urlPattern.replace("<request>", "user/emails");
            String result2 = IOUtils.readStringFromStream(new URL(url2).openStream());
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> json2 = JSON.readValue(result2, List.class);
            for(Map<String, Object> entry : json2) {
            	Object primary = entry.get("primary");
            	if(primary != null && primary instanceof Boolean && (Boolean)primary) {
                    newInfo.email = (String) entry.get("email");
            	}
            }
            if(newInfo.email == null || newInfo.email.trim().isEmpty()) {
            	throw new RuntimeException("Unable to determine user email from JSON: " + result2);
            }
        } catch (Exception e) {
            LOG.warn("Unable to process auth headers: " + e);
            return null;
        }

		return newInfo;
	}

}
