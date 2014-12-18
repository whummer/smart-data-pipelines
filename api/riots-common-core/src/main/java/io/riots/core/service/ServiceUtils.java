package io.riots.core.service;

import java.net.URI;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletWebRequest;

/**
 * Util functions for service requests.
 * @author whummer
 */
public class ServiceUtils {

	/**
	 * Call this method only from within a service invocation context.
	 * @param code
	 */
	public static void setResponseStatus(int code) {
		((ServletWebRequest) RequestContextHolder.getRequestAttributes())
			.getResponse().setStatus(code);
	}

	public static void setHeaderLocation(URI location) {
		((ServletWebRequest) RequestContextHolder.getRequestAttributes())
			.getResponse().setHeader("Location", location.toString());
	}

}
