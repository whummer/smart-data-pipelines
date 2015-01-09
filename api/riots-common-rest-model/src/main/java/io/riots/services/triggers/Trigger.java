package io.riots.services.triggers;

import io.riots.services.model.interfaces.ObjectCreated;
import io.riots.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;

import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Abstract class for various trigger functions available 
 * to the users (e.g., geo fences, collision detection, ...).
 * @author whummer
 */
@JsonSubTypes({
	@Type(value = Trigger.class, name="UNDEFINED"),
	@Type(value = GeoFence.class, name="GEO_FENCE")
})
@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	include = JsonTypeInfo.As.PROPERTY,
	property = "type"
)
public class Trigger implements ObjectCreated, ObjectIdentifiable {

	/**
	 * Identifier.
	 */
	@JsonProperty
	String id;

	/**
	 * Trigger Type.
	 */
	@JsonProperty
	TriggerType type = TriggerType.UNDEFINED;

	/**
	 * Name.
	 */
	@JsonProperty
	String name;

	/**
	 * Creation date.
	 */
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creation-date")
	@Field(type = FieldType.Date)
	Date created;

	/**
	 * Creator
	 */
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creator-id")
	String creatorId;

	/**
	 * Type of trigger.
	 */
	public static enum TriggerType {
		GEO_FENCE, UNDEFINED
	}

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

}