package io.riots.services.catalog;

import static org.springframework.data.elasticsearch.annotations.FieldType.Object;
import static org.springframework.data.elasticsearch.annotations.FieldType.String;
import io.riots.services.scenario.Thing;

import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents the "type" of a {@link Thing}
 * 
 * @author Waldemar Hummer
 * @author riox
 */
@Document(indexName = "thing-types", type = "thing-type")
public class ThingType extends HierarchicalObject<String> {

	@JsonInclude(Include.NON_EMPTY)
	@Id
	private String id;

	@JsonInclude(Include.NON_EMPTY)
	@Field(type = FieldType.String, store=true)
	private String description;

	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creation-date")
	@Field(type = FieldType.Date)
	private Date created;

	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creator-id")
	private String creatorId;

	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("manufacturer-id")
	private String manufacturerId;

	@JsonInclude(Include.NON_EMPTY)
	@Field(type = Object, store = true)
	private Map<String, String> features = new HashMap<>();

	@JsonInclude(Include.NON_EMPTY)
	@Field(type = String, store = true)
	private List<String> tags = new LinkedList<String>();

	@JsonProperty("image-data")
	@JsonInclude(Include.NON_EMPTY)
	@Field(type = FieldType.Nested, store = true)	
	private List<ImageData> imageData;

	/**
	 * Contains the list of properties that are "actuatable" within this device.
	 * Actuatable properties are either 1) sensable properties reported by a
	 * sensor device (e.g., room temperature), or 2) actuatable properties
	 * (e.g., temperature of a heater). A property can also be both sensable and
	 * actuatable.
	 */
	@JsonProperty("properties")
	@JsonInclude(Include.NON_EMPTY)
	@Field(type = Object, store = true)
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

	public void setDescription(String description) {
		this.description = description;
	}

	public String getDescription() {
		return description;
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

	public void setDeviceProperties(List<Property> properties) {
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
	public void addTag(String tag) {
		tags.add(tag);
	}

	public ThingType withProperties(final List<Property> properties) {
		this.properties = properties;
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
	public int hashCode() {
		final int prime = 31;
		int result = super.hashCode();
		result = prime * result
				+ ((features == null) ? 0 : features.hashCode());
		result = prime * result
				+ ((imageData == null) ? 0 : imageData.hashCode());
		result = prime * result
				+ ((manufacturerId == null) ? 0 : manufacturerId.hashCode());
		result = prime * result
				+ ((properties == null) ? 0 : properties.hashCode());
		result = prime * result + ((tags == null) ? 0 : tags.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (!super.equals(obj))
			return false;
		if (getClass() != obj.getClass())
			return false;
		ThingType other = (ThingType) obj;
		if (features == null) {
			if (other.features != null)
				return false;
		} else if (!features.equals(other.features))
			return false;
		if (imageData == null) {
			if (other.imageData != null)
				return false;
		} else if (!imageData.equals(other.imageData))
			return false;
		if (manufacturerId == null) {
			if (other.manufacturerId != null)
				return false;
		} else if (!manufacturerId.equals(other.manufacturerId))
			return false;
		if (properties == null) {
			if (other.properties != null)
				return false;
		} else if (!properties.equals(other.properties))
			return false;
		if (tags == null) {
			if (other.tags != null)
				return false;
		} else if (!tags.equals(other.tags))
			return false;
		return true;
	}

}
