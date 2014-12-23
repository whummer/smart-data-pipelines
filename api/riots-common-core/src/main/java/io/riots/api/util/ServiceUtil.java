package io.riots.api.util;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;

import javax.ws.rs.core.UriBuilder;

import org.apache.cxf.jaxrs.ext.MessageContext;

/**
 * Utility methods for service invocations.
 * @author whummer
 */
public class ServiceUtil {

	public static final String API_HOST = "api.riots.io";
	public static final int API_PORT = 8080;
	public static final String API_PATH = "/api/v1";
	public static final URL API_CONTEXT_URL;

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
	public static void setLocationHeader(MessageContext context, String location) {
        context.getHttpServletResponse().addHeader("Location", location);
	}

	public static URI getPath(MessageContext context, String path) {
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
}
