package com.viotualize.services.model;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.viotualize.services.model.SmartObject;

public class CatalogEntry {

	private String id;
	private String name;
	private String description;

	private String visibility;
	private String creator;

	@JsonProperty("creation-time")
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm", timezone = "UTC")
	private Date creationTime;

	@JsonProperty("last-update-time")
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm", timezone = "UTC")
	private Date lastUpdateTime;

	@JsonProperty("product-url")
	private String productUrl;

	@JsonProperty("image-url")
	private String imageUrl;

	@JsonProperty("rating")
	private long overallRating;

	private List<Comment> comments;
	private String version;
	private List<String> collaborators;

	@JsonProperty("smartobject")
	private SmartObject smartObject;

	private Cost cost;

	public CatalogEntry() {
		// nothing to so
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getVisibility() {
		return this.visibility;
	}

	public void setVisibility(String visibility) {
		this.visibility = visibility;
	}

	public String getCreator() {
		return this.creator;
	}

	public void setCreator(String creator) {
		this.creator = creator;
	}

	public Date getCreationTime() {
		return this.creationTime;
	}

	public void setCreationTime(Date creationTime) {
		this.creationTime = creationTime;
	}

	public Date getLastUpDate() {
		return this.lastUpdateTime;
	}

	public void setLastUpdateTime(Date lastUpdateTime) {
		this.lastUpdateTime = lastUpdateTime;
	}

	public String getProductUrl() {
		return this.productUrl;
	}

	public void setProductUrl(String productUrl) {
		this.productUrl = productUrl;
	}

	public String getImageUrl() {
		return this.imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public long getOverallRating() {
		return this.overallRating;
	}

	public void setOverallRating(long overallRating) {
		this.overallRating = overallRating;
	}

	public List<Comment> getComments() {
		return this.comments;
	}

	public void setComments(List<Comment> comments) {
		this.comments = comments;
	}

	public String getVersion() {
		return this.version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public List<String> getCollaborators() {
		return this.collaborators;
	}

	public void setCollaborators(List<String> collaborators) {
		this.collaborators = collaborators;
	}

	public SmartObject getSmartObject() {
		return this.smartObject;
	}

	public void setSmartObjects(SmartObject smartObject) {
		this.smartObject = smartObject;
	}

	public Cost getCost() {
		return cost;
	}

	public void setCost(Cost cost) {
		this.cost = cost;
	}

}