package io.riots.services.utils;

import io.riots.services.model.Location;
import io.riots.services.model.interfaces.ObjectCreated;
import io.riots.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;

import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * Represents a geo-fence in the platform.
 * @author whummer
 */
public class GeoFence implements ObjectCreated, ObjectIdentifiable {

	/**
	 * Identifier.
	 */
	@JsonProperty
	private String id;

	/**
	 * Creation date.
	 */
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creation-date")
	@Field(type = FieldType.Date)
	private Date created;

	/**
	 * Creator
	 */
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creator-id")
	private String creatorId;

	/**
	 * Center location of the geo fence.
	 */
	@JsonProperty
	private Location center;

	/**
	 * Diameter of the geo fence.
	 */
	@JsonProperty
	private double diameter;

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