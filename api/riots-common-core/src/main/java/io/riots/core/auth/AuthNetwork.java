package io.riots.core.auth;

import java.util.Arrays;
import java.util.List;

import io.riots.core.auth.AuthHeaders.AuthInfo;

/**
 * Access to OAuth based authentication networks, 
 * e.g., facebook, github, google, etc.
 * @author whummer
 */
public abstract class AuthNetwork {

	public static final String GITHUB = "github";
	public static final String GOOGLE = "google";
	public static final String FACEBOOK = "facebook";

	public static final List<String> NETWORKS = 
			Arrays.asList(GITHUB, GOOGLE, FACEBOOK);

	public abstract AuthInfo verifyAccessToken(String token);

	public static AuthNetwork get(String network) {
		if(network.equals(GITHUB)) {
			return github();
		}
		if(network.equals(GOOGLE)) {
			return google();
		}
		if(network.equals(FACEBOOK)) {
			return facebook();
		}
		throw new IllegalArgumentException("Unknown auth network: " + network);
	}

	public static AuthNetwork facebook() {
		return new AuthNetworkFacebook();
	}
	public static AuthNetworkGoogle google() {
		return new AuthNetworkGoogle();
	}
	public static AuthNetworkGithub github() {
		return new AuthNetworkGithub();
	}

}
