package io.riots.core.auth;

import io.riots.api.services.users.AuthInfo;
import io.riots.api.services.users.AuthInfoExternal;
import io.riots.api.services.users.AuthToken;

import java.util.Arrays;
import java.util.List;

/**
 * Access to OAuth based authentication networks, 
 * e.g., facebook, github, google, etc.
 * @author whummer
 */
public abstract class AuthNetwork {

	public static final String GITHUB = "github";
	public static final String GOOGLE = "google";
	public static final String FACEBOOK = "facebook";
	public static final String RIOTS = "riots";

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
		if(network.equals(RIOTS)) {
			return riots();
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
	public static AuthNetworkRiots riots() {
		return new AuthNetworkRiots();
	}

	public static AuthInfoExternal verifyAccessToken(AuthToken r) {
		return get(r.network).verifyAccessToken(r.token);
	}

}
