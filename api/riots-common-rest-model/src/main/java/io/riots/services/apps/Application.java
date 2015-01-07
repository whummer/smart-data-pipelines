package io.riots.services.apps;

import io.riots.services.model.interfaces.ObjectCreated;
import io.riots.services.model.interfaces.ObjectIdentifiable;
import io.riots.services.users.User;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents a user application.
 * @author Waldemar Hummer
 */
public class Application implements ObjectCreated, ObjectIdentifiable {

	@JsonProperty
	String id;
	@JsonProperty
	Date created;
	@JsonProperty
	String creatorId;

	@JsonProperty
	String name;
	@JsonProperty
	String appKey;
	@JsonProperty
	List<String> users = new LinkedList<>();

	/**
	 * Determine if the given user is authorized to access this app.
	 * @param user
	 */
	public boolean isAuthorized(User user) {
		if(user == null)
			return false;
		// TODO: more complex permissions for applications
		return user.getId().equals(creatorId);
	}

	/* GETTERS/SETTERS */

	public String getId() {
		return id;
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
	public String getAppKey() {
		return appKey;
	}
	public void setAppKey(String key) {
		this.appKey = key;
	}
	public String getName() {
		return name;
	}

}
