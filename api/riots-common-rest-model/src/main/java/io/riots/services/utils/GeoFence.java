package io.riots.services.utils;

import io.riots.services.model.Location;
import io.riots.services.model.interfaces.ObjectCreated;
import io.riots.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GeoFence implements ObjectCreated, ObjectIdentifiable {

	@JsonProperty
	private String id;
	@JsonProperty
	private Date created;
	@JsonProperty
	private String creatorId;

	@JsonProperty
	private Location center;
	@JsonProperty
	private double diameter;

	// TODO: define which things are affected by the geo fence, i.e.,
	// which things we want to continuously monitor...
//	@JsonProperty
//	private List<String> affectedThings;

	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public Location getCenter() {
		return center;
	}
	public double getDiameter() {
		return diameter;
	}
	public Date getCreated() {
		return created;
	}
	public String getCreatorId() {
		return creatorId;
	}
	public void setCreated(Date created) {
		this.created = created;
	}
	public void setCreatorId(String creatorId) {
		this.creatorId = creatorId;
	}

	@Override
	public String toString() {
		return "GeoFence [id=" + id + ", created=" + created + ", creatorId="
				+ creatorId + ", center=" + center + ", diameter=" + diameter
				+ "]";
	}

}