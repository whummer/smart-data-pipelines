package io.riox.transform;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.integration.annotation.MessageEndpoint;
import org.springframework.integration.annotation.Transformer;

/**
 * Implements a transformer for JSON data that removes all the elements from the payload that
 * are specified in the excludes filter with a comma separated list of path
 * expressions (e.g., key0,key1.subkey11.subsubkey111). Keys that do not exist will be 
 * silently ignored.
 * 
 * @author riox
 */
@MessageEndpoint
public class DataContentFilter {

	private static final String PATH_SPLIT_REGEX = "\\.";
	private Set<String> excludes = null;

	public DataContentFilter() { /* nothing to be done here */
	}

	public DataContentFilter(@Value("excludes") final String excludes) {
		this.excludes = new HashSet<String>();
		// splits "a,b" or "a,    b"
		Collections.addAll(this.excludes, excludes.split("\\,\\s*")); 
	}
	

	@Transformer(inputChannel = "input", outputChannel = "output")
	public String transform(String payload) {
		JSONObject json = null;
		try {
			json = new JSONObject(payload);
			for (String ex : excludes) {
				String[] fqPath = ex.split(PATH_SPLIT_REGEX);
				JSONObject parent = null;
				String parentKey = null;
				JSONObject obj = json;

				for (int i = 0; i < fqPath.length - 1; i++) {
					parentKey = fqPath[i];
					parent = obj;
					obj = (JSONObject) obj.get(fqPath[i]);
				}
				
				// delete the final element in the fqPath
				obj.remove(fqPath[fqPath.length - 1]);
				
				// if obj does not have any children anymore clean it too
				if (obj.length() == 0) {
					parent.remove(parentKey);					
				}
			}

		} catch (JSONException e) {
			return "{ \"error\" : \" Error while parsing JSON. Please check JSON payload and exclude expressions.\" }";  

		}
		return json.toString();
	}

}
