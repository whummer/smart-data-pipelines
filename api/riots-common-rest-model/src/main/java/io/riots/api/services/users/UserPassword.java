package io.riots.api.services.users;

import io.riots.api.services.model.interfaces.ObjectIdentifiable;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Entity to store (hashed) user passwords.
 * 
 * @author whummer
 */
public class UserPassword implements ObjectIdentifiable {

	/**
	 * Unique identifier.
	 */
	@JsonProperty
	private String id;
	/**
	 * User identifier.
	 */
	@JsonProperty
	private String userId;
	/**
	 * Password of this user, if available. The password
	 * is not stored here if this user is authenticated via OAuth.
	 * Otherwise, if the user is registered with riots, the 
	 * password is stored here in hashed form, e.g., SHA-256. 
	 * See {@link PasswordHasher} class.
	 */
	@JsonProperty
	private String password;

	public UserPassword() {}
	public UserPassword(String userId, String password) {
		this.userId = userId;
		this.password = password;
	}

	@Override
	public String getId() {
		return id;
	}
	public String getPassword() {
		return password;
	}
	public String getUserId() {
		return userId;
	}
	
}
