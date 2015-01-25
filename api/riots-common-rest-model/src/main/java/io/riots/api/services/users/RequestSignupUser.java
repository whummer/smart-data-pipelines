package io.riots.api.services.users;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request object for registering a new user.
 * @author whummer
 */
public class RequestSignupUser extends User {

	/**
	 * Password, in hashed form (typically SHA-256).
	 */
	@JsonProperty
	public String password;

}
