package io.riots.api.services.tenants;

import io.riots.api.services.catalog.ImageData;
import io.riots.api.services.model.Constants;
import io.riots.api.services.model.interfaces.ObjectCreated;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;
import io.riots.api.services.model.interfaces.ObjectNamed;
import io.riots.api.services.model.interfaces.ObjectWithImages;

import java.util.Date;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Class to represent organizations. By default, each 
 * user is associated with an organization.
 * @author whummer
 */
public class Organization implements ObjectIdentifiable, ObjectNamed, ObjectCreated, ObjectWithImages {

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
	private Set<String> members = new HashSet<String>();
	/**
	 * Image data.
	 */
	@JsonProperty(Constants.IMAGE_DATA)
	private List<ImageData> imageData = new LinkedList<ImageData>();


	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Set<String> getMembers() {
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
	public List<ImageData> getImageData() {
		return imageData;
	}
	public void setImageData(List<ImageData> imageData) {
		this.imageData = imageData;
	}
}
