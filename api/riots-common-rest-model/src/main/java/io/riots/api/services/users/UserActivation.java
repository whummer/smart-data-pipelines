package io.riots.api.services.users;

import io.riots.api.services.model.interfaces.ObjectCreated;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;

import org.springframework.util.StringUtils;

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
	/**
	 * Flag to forcefully deactivate this user (set by admins).
	 */
	@JsonProperty
	private boolean deactivated;

	public UserActivation() {}
	public UserActivation(String userId, String activationKey) {
		this.userId = userId;
		this.activationKey = activationKey;
	}

	/**
	 * Determine whether this account is currently active and ready for use.
	 */
	public boolean checkIsAccountActive() {
		/* EITHER manually deactivated */
		if(isDeactivated()) {
			return false;
		}
		/* OR email activation key not yet confirmed/activated */
		if(!checkIsEmailConfirmed()) {
			return false;
		}
		return true;
	}
	/**
	 * Whether this user's email address has been confirmed.
	 */
	public boolean checkIsEmailConfirmed() {
		return StringUtils.isEmpty(getActivationKey()) || getActivationDate() > 0;
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
	public void setActivationKey(String activationKey) {
		this.activationKey = activationKey;
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
	public boolean isDeactivated() {
		return deactivated;
	}
	public void setDeactivated(boolean deactivated) {
		this.deactivated = deactivated;
	}
	public String getCreatorId() {
		return creatorId;
	}
	public void setCreatorId(String creatorId) {
		this.creatorId = creatorId;
	}

}
