package io.riots.api.services.users;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request object for requesting a valid {@link AuthToken}.
 * @author whummer
 */
public class RequestGetAuthToken {

	/**
	 * Either "riots", or a third-party OAuth network,
	 * e.g., "github", "google", "facebook"
	 */
	@JsonProperty
	public String network;
	/**
	 * Name which identifies the user in the respective network.
	 * In riots, the "username" is the user's email address.
	 */
	@JsonProperty
	public String username;
	/**
	 * Password, hashed (typically SHA-256).
	 */
	@JsonProperty
	public String password;

}
