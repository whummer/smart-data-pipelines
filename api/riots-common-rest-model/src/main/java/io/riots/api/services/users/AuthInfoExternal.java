package io.riots.api.services.users;

import io.riots.api.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Class which holds authentication information.
 */
public class AuthInfoExternal implements ObjectIdentifiable {

	/**
	 * Identifier.
	 */
	private String id;
	/**
	 * Authentication network, e.g., "riots" or "github"
	 */
	@JsonProperty
	private String network;
	/**
	 * Unique access token for the given network.
	 */
	@JsonProperty
	private String accessToken;
	/**
	 * Time of expiry of the token.
	 */
	@JsonProperty
	private Date expiry;
	/**
	 * ID of the authenticated user.
	 */
	@JsonProperty
	private String userID;
	/**
	 * Display name of the authenticated user.
	 */
	@JsonProperty
	private String name;
	/**
	 * Email of the authenticated user.
	 */
	@JsonProperty
	private String email;
	/**
	 * Avatar image URL of the authenticated user.
	 */
	@JsonProperty
	private String avatar;

	public AuthInfoExternal() {}

	public AuthInfoExternal(AuthInfoExternal copyFrom) {
		copyFrom(copyFrom);
	}

	public void copyFrom(AuthInfoExternal from) {
		this.setNetwork(from.getNetwork());
		this.setAccessToken(from.getAccessToken());
		this.setExpiry(from.getExpiry());
		this.setUserID(from.getUserID());
		this.setName(from.getName());
		this.setEmail(from.getEmail());
		this.setAvatar(from.getAvatar());
	}

	@JsonIgnore
	public boolean isExpired() {
		return expiry.before(new Date());
	}

	public String getId() {
		return id;
	}

	public Date getExpiry() {
		return expiry;
	}

	public void setExpiry(Date expiry) {
		this.expiry = expiry;
	}

	public String getAvatar() {
		return avatar;
	}

	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}

	public String getUserID() {
		return userID;
	}

	public void setUserID(String userID) {
		this.userID = userID;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getAccessToken() {
		return accessToken;
	}

	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getNetwork() {
		return network;
	}
	
	public void setNetwork(String network) {
		this.network = network;
	}

	@Override
	public String toString() {
		return "AuthInfoExternal [userID=" + getUserID() + ", userName=" + getName()
				+ ", email=" + getEmail() + ", network=" + getNetwork()
				+ ", accessToken=" + getAccessToken() + ", expiry=" + getExpiry() + "]";
	}

}