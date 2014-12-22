package io.riots.api.util;

import java.net.URI;

import javax.ws.rs.core.UriBuilder;

import org.apache.cxf.jaxrs.ext.MessageContext;

/**
 * Utility methods for service invocations.
 * @author whummer
 */
public class ServiceUtil {

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
	
	public static void main(String[] args) {
		String contextPath = "http://localhost/api/v1/things/";
		String path = "../things/23423234";
		//UriInfo i = new UriInfoImpl(Messa)
		System.out.println(UriBuilder.fromPath(contextPath).path(path).build());
	}
}
