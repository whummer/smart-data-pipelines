package io.riots.api.services.users;

import java.util.Date;

import io.riots.api.services.model.interfaces.ObjectCreated;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Entity to store user activation info.
 * 
 * @author whummer
 */
public class UserActivation implements ObjectIdentifiable, ObjectCreated {

	/**
	 * Unique identifier.
	 */
	@JsonProperty
	private String id;
	/**
	 * Creating user id.
	 */
	@JsonProperty
	private String creatorId;
	/**
	 * Creation date.
	 */
	@JsonProperty
	private Date created;
	/**
	 * User identifier.
	 */
	@JsonProperty
	private String userId;
	/**
	 * Activation key.
	 */
	@JsonProperty
	private String activationKey;
	/**
	 * The date when this user account has been activated (via email).
	 */
	@JsonProperty
	private long activationDate;

	public UserActivation() {}
	public UserActivation(String userId, String activationKey) {
		this.userId = userId;
		this.activationKey = activationKey;
	}


	@Override
	public String getId() {
		return id;
	}
	public String getUserId() {
		return userId;
	}
	public String getActivationKey() {
		return activationKey;
	}
	public long getActivationDate() {
		return activationDate;
	}
	public void setActivationDate(long activationDate) {
		this.activationDate = activationDate;
	}
	public Date getCreated() {
		return created;
	}
	public void setCreated(Date created) {
		this.created = created;
	}
	public String getCreatorId() {
		return creatorId;
	}
	public void setCreatorId(String creatorId) {
		this.creatorId = creatorId;
	}

}
