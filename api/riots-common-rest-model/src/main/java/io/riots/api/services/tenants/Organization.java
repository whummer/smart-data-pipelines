package io.riots.api.services.tenants;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.riots.api.services.model.Constants;
import io.riots.api.services.model.interfaces.ObjectCreated;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;
import io.riots.api.services.model.interfaces.ObjectNamed;

/**
 * Class to represent organizations. By default, each 
 * user is associated with an organization.
 * @author whummer
 */
public class Organization implements ObjectIdentifiable, ObjectNamed, ObjectCreated {

	public static final String DEFAULT_ORGANIZATION_NAME = "Default Organization";

	/**
	 * Identifier.
	 */
	@JsonProperty
	private String id;
	/**
	 * Id of creating user.
	 */
	@JsonProperty(Constants.CREATOR_ID)
	private String creatorId;
	/**
	 * Creation date.
	 */
	@JsonProperty(Constants.CREATION_DATE)
	private Date created;
	/**
	 * Name of the organization.
	 */
	@JsonProperty(Constants.NAME)
	private String name;
	/**
	 * List of userIds of users who are
	 * member of this organization.
	 */
	@JsonProperty
	private List<String> members;

	public String getId() {
		return id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public List<String> getMembers() {
		return members;
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
