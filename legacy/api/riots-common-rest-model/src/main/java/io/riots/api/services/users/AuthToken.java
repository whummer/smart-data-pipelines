package io.riots.api.services.users;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Authentication token.
 * @author whummer
 */
public class AuthToken {

	/**
	 * Either "riots", or a third-party OAuth network,
	 * e.g., "github", "google", "facebook"
	 */
	@JsonProperty
	public String network;
	/**
	 * Unique Token string.
	 */
	@JsonProperty
	public String token;
	/**
	 * Expiry date, timestamp encoded in Unix time (milliseconds since 1970-01-01).
	 */
	@JsonProperty
	public long expiry;

	public AuthToken() {}
	public AuthToken(String network, String token) {
		this.network = network;
		this.token = token;
	}


	@Override
	public String toString() {
		return "AuthToken [network=" + network + ", token=" + token
				+ ", expiry=" + expiry + "]";
	}

}
