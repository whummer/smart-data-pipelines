package io.riots.core.util;

import io.riots.api.services.model.interfaces.ObjectIdentifiable;
import io.riots.api.services.users.User;
import io.riots.core.auth.AuthHeaders;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;

import org.apache.commons.lang.StringUtils;
import org.apache.cxf.jaxrs.ext.MessageContext;
import org.apache.log4j.Logger;

/**
 * Utility methods for clients invocations.
 * @author whummer
 */
public class ServiceUtil {

	public static final String API_HOST = "api.riots.io";
	public static final int API_PORT = 8080;
	public static final String API_PATH = "/api/v1/";
	public static final URL API_CONTEXT_URL;

	private static final Logger LOG = Logger.getLogger(ServiceUtil.class);

	static {
		try {
			API_CONTEXT_URL = new URL("http", API_HOST, API_PORT, API_PATH);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public static void setLocationHeader(MessageContext context, URI location) {
		setLocationHeader(context, location.toString());
	}
	public static void setLocationHeader(MessageContext context, URL location) {
		setLocationHeader(context, location.toString());
	}
	public static void setLocationHeader(MessageContext context, String location) {
		if(context == null) {
			LOG.warn("Cannot set location header for MessageContext: " + context);
			return;
		}
        context.getHttpServletResponse().addHeader("Location", location);
	}
	public static void setResponseStatus(MessageContext context, int statusCode) {
		if(context == null) {
			LOG.warn("Cannot set response status for MessageContext: " + context);
			return;
		}
		context.getHttpServletResponse().setStatus(statusCode);
	}
	public static void setResponseContentType(MessageContext context,
			String contentType) {
		if(context == null) {
			LOG.warn("Cannot set content type for MessageContext: " + context);
			return;
		}
        context.getHttpServletResponse().addHeader("Content-Type", contentType);		
	}
	public static URI getPath(MessageContext context, String path) {
		if(context == null) {
			try {
				LOG.warn("Cannot get info for path '" + path + "' from MessageContext: " + context);
				return new URI(path);
			} catch (URISyntaxException e) {
				throw new RuntimeException(e);
			}
		}
		String contextPath = context.getHttpServletRequest().getRequestURI();
		URI uri = UriBuilder.fromPath(contextPath).path(path).build().normalize();
		return uri;
	}

	public static URL getHref(URI uri) {
		try {
			return getHref(uri.toURL());
		} catch (MalformedURLException e) {
			return getHref(uri.toString());
		}
	}
	public static URL getHref(String path) {
		try {
			URL url = new URL(API_CONTEXT_URL, path);
			return getHref(url);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	public static URL getHref(URL url) {
		try {
			url = new URL(url.getProtocol(), API_HOST, API_PORT, url.getPath());
			return url;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	public static void assertValidUser(User user) {
		if(user == null) {
			throw new WebApplicationException("Please provide valid authentication headers.");
		}
	}
	public static User assertValidUser(AuthHeaders authHeaders,
			HttpServletRequest req) {
		try {
			User user = authHeaders.getRequestingUser(req);
			assertValidUser(user);
			return user;
		} catch (RuntimeException e) {
			LOG.warn("Unable to get user for auth headers " + AuthHeaders.getHeaders(req));
			throw e;
		}
	}

	public static WebApplicationException webappError(int status, String msg) {
    	Map<String,Object> response = new HashMap<>();
    	response.put("status", status);
    	response.put("message", msg);
    	return new WebApplicationException(Response.status(status)
    			.entity(response)
    			.header("Content-Type", MediaType.APPLICATION_JSON)
    			.build());
    }
    public static WebApplicationException forbidden(String msg) {
    	return webappError(HttpServletResponse.SC_FORBIDDEN, msg);
    }
	public static WebApplicationException serverErrror(String msg) {
    	return webappError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, msg);
	}
	public static void assertIdIsNull(ObjectIdentifiable entity) {
		if(!StringUtils.isEmpty(entity.getId())) {
			throw serverErrror("'id' should be null. "
					+ "To update an existing entity, use the HTTP PUT method.");
		}
	}
	public static void assertIdIsNotNull(ObjectIdentifiable entity) {
		if(StringUtils.isEmpty(entity.getId())) {
			throw serverErrror("'id' should not be null.");
		}
	}

}
