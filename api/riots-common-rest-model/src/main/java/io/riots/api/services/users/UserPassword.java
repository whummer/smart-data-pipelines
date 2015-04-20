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
	 * Identifier of the user this password item belongs to.
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
	public void setId(String id) {
		this.id = id;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getUserId() {
		return userId;
	}
	public void copyFrom(UserPassword other) {
		this.setId(other.getId());
		this.setUserId(other.getUserId());
		this.setPassword(other.getPassword());
	}

}
