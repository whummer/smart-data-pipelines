package io.riots.core.test;

import io.riots.core.auth.AuthHeaders;

import org.apache.cxf.jaxrs.client.WebClient;

/**
 * Test utilities.
 * @author whummer
 */
public class TestUtils {

	public static void resetHeaders(Object service) {
        WebClient.client(service).reset();
	}

	public static void setTestUserEmailHeader(Object service, String email) {
		resetHeaders(service);
        AuthHeaders.THREAD_AUTH_INFO.get().get().setEmail(email);
        WebClient.client(service).header(AuthHeaders.HEADER_AUTH_EMAIL, email);
	}

	public static void setTestHeader(Object service, String key, String value) {
        WebClient.client(service).header(key, value);
	}

}
