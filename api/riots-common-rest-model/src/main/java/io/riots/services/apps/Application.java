package io.riots.services.apps;

import io.riots.services.model.Constants;
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

	/**
	 * Identifier.
	 */
	@JsonProperty
	String id;
	/**
	 * Creation Date.
	 */
	@JsonProperty(Constants.CREATION_DATE)
	Date created;
	/**
	 * ID of creating user.
	 */
	@JsonProperty(Constants.CREATOR_ID)
	String creatorId;

	/**
	 * Name of this application.
	 */
	@JsonProperty
	String name;
	/**
	 * Unique application key (used for authentication).
	 */
	@JsonProperty
	String appKey;
	/**
	 * List of things associated with this application.
	 */
	@JsonProperty(Constants.THINGS)
	List<String> things = new LinkedList<>();
	/**
	 * List of users with access to this application.
	 * // TODO
	 */
//	@JsonProperty(Constants.USERS)
//	List<String> users = new LinkedList<>();


	public Application() {}
	public Application(String name) {
		this.name = name;
	}

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
	public List<String> getThings() {
		return things;
	}

}
