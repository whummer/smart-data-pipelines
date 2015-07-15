package io.riots.api.services.catalog;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.riots.api.services.model.Constants;
import io.riots.api.services.model.interfaces.ObjectWithImages;
import io.riots.api.services.scenarios.Thing;

import java.util.*;

/**
 * Represents the "type" of a {@link Thing}
 *
 * @author Waldemar Hummer
 * @author riox
 */
public class ThingType extends HierarchicalObject<String> implements ObjectWithImages {

	@JsonInclude(Include.NON_EMPTY)
	private String id;

	@JsonInclude(Include.NON_EMPTY)
	private String description;

	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty(Constants.CREATION_DATE)
	private Date created;

	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty(Constants.CREATOR_ID)
	private String creatorId;

	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty(Constants.MANUFACTURER_ID)
	private String manufacturerId;

	@JsonInclude(Include.NON_EMPTY)
	private Map<String, String> features = new HashMap<>();

	@JsonInclude(Include.NON_EMPTY)
	private List<String> tags = new LinkedList<String>();

	@JsonProperty(Constants.IMAGE_DATA)
	@JsonInclude(Include.NON_EMPTY)
	private List<ImageData> imageData;

	/**
	 * Contains the list of properties that are "actuatable" within this device.
	 * Actuatable properties are either 1) sensable properties reported by a
	 * sensor device (e.g., room temperature), or 2) actuatable properties
	 * (e.g., temperature of a heater). A property can also be both sensable and
	 * actuatable.
	 */
	@JsonProperty(Constants.PROPERTIES)
	@JsonInclude(Include.NON_EMPTY)
	private List<Property> properties = new LinkedList<Property>();

	public ThingType() {
	}

	public ThingType(String name) {
		super(name);
	}

	/* GETTERS/SETTERS */

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
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

	public String getManufacturerId() {
		return manufacturerId;
	}

	public void setManufacturerId(String manufacturerId) {
		this.manufacturerId = manufacturerId;
	}

	public List<ImageData> getImageData() {
		return imageData;
	}

	public void setImageData(List<ImageData> imageData) {
		this.imageData = imageData;
	}

	public List<Property> getProperties() {
		return properties;
	}

	public void setProperties(List<Property> properties) {
		this.properties = properties;
	}

	public ThingType addFeature(final String key, final String value) {
		features.put(key, value);
		return this;
	}

	public Map<String, String> getFeatures() {
		return features;
	}

	public void setFeatures(Map<String, String> features) {
		this.features = features;
	}

	public List<String> getTags() {
		return tags;
	}

	public void setTags(List<String> tags) {
		this.tags = tags;
	}

	public ThingType addTag(String tag) {
		tags.add(tag);
		return this;
	}

	public ThingType withProperties(final List<Property> properties) {
		this.properties = properties;
		return this;
	}

	public ThingType addProperty(Property property) {
		this.properties.add(property);
		return this;
	}

	public ThingType withId(final java.lang.String id) {
		this.id = id;
		return this;
	}

	public ThingType withDescription(final java.lang.String description) {
		this.description = description;
		return this;
	}

	public ThingType withCreated(final Date created) {
		this.created = created;
		return this;
	}

	public ThingType withCreatorId(final java.lang.String creatorId) {
		this.creatorId = creatorId;
		return this;
	}

	public ThingType withManufacturerId(final java.lang.String manufacturerId) {
		this.manufacturerId = manufacturerId;
		return this;
	}

	public ThingType withFeatures(final Map<java.lang.String, java.lang.String> features) {
		this.features = features;
		return this;
	}

	public ThingType withTags(final List<java.lang.String> tags) {
		this.tags = tags;
		return this;
	}

	public ThingType withImageData(final List<ImageData> imageData) {
		this.imageData = imageData;
		return this;
	}


	@Override
	public String toString() {
		return "ThingType [id=" + id + ", description=" + description
				+ ", created=" + created + ", creatorId=" + creatorId
				+ ", manufacturerId=" + manufacturerId + ", features="
				+ features + ", tags=" + tags + ", imageData=" + imageData
				+ ", properties=" + properties + "]";
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof ThingType)) return false;

		ThingType thingType = (ThingType) o;

		if (created != null ? !created.equals(thingType.created) : thingType.created != null) return false;
		if (creatorId != null ? !creatorId.equals(thingType.creatorId) : thingType.creatorId != null) return false;
		if (description != null ? !description.equals(thingType.description) : thingType.description != null)
			return false;
		if (features != null ? !features.equals(thingType.features) : thingType.features != null) return false;
		if (id != null ? !id.equals(thingType.id) : thingType.id != null) return false;
		if (imageData != null ? !imageData.equals(thingType.imageData) : thingType.imageData != null) return false;
		if (manufacturerId != null ? !manufacturerId.equals(thingType.manufacturerId) : thingType.manufacturerId != null)
			return false;
		if (properties != null ? !properties.equals(thingType.properties) : thingType.properties != null) return false;
		if (tags != null ? !tags.equals(thingType.tags) : thingType.tags != null) return false;

		return true;
	}

	@Override
	public int hashCode() {
		int result = id != null ? id.hashCode() : 0;
		result = 31 * result + (description != null ? description.hashCode() : 0);
		result = 31 * result + (created != null ? created.hashCode() : 0);
		result = 31 * result + (creatorId != null ? creatorId.hashCode() : 0);
		result = 31 * result + (manufacturerId != null ? manufacturerId.hashCode() : 0);
		result = 31 * result + (features != null ? features.hashCode() : 0);
		result = 31 * result + (tags != null ? tags.hashCode() : 0);
		result = 31 * result + (imageData != null ? imageData.hashCode() : 0);
		result = 31 * result + (properties != null ? properties.hashCode() : 0);
		return result;
	}
}
