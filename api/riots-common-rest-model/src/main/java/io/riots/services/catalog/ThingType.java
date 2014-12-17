package io.riots.services.catalog;

import static org.springframework.data.elasticsearch.annotations.FieldType.Object;
import static org.springframework.data.elasticsearch.annotations.FieldType.String;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents the "type" of a {@link Thing}
 * 
 * @author Waldemar Hummer
 * @author riox
 */
@Document(indexName = "thing-types", type = "thing", shards = 1, replicas = 0, refreshInterval = "-1", indexStoreType = "memory")
public class ThingType extends HierarchicalObject<ThingType> {

	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("manufacturer-id")
	private String manufacturerId;

	@JsonInclude(Include.NON_EMPTY)
    @Field(type = String, store = true)
	private Map<String, String> features = new HashMap<>();

	@JsonInclude(Include.NON_EMPTY)
    @Field(type = String, store = true)
	private List<String> tags = new LinkedList<String>();

	@JsonProperty("image-urls")
	@JsonInclude(Include.NON_EMPTY)
    @Field(type = String, store = true)
	private List<String> imageUrls;

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
	private List<Property<?>> properties = new LinkedList<Property<?>>();

	public ThingType() {
	}

	public ThingType(String name) {
		super(name);
	}

	public String getManufacturerId() {
		return manufacturerId;
	}

	public void setManufacturerId(String manufacturerId) {
		this.manufacturerId = manufacturerId;
	}

	public List<String> getImageUrls() {
		return imageUrls;
	}

	public void setImageUrls(List<String> imageUrls) {
		this.imageUrls = imageUrls;
	}

	public List<Property<?>> getProperties() {
		return properties;
	}

	public void setDeviceProperties(List<Property<?>> properties) {
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

	@Override
	public String toString() {
		return "ThingType [manufacturer=" + manufacturerId + ", semanticType="
				+ "features=" + features + ", tags=" + tags
				+ ", imageUrls=" + imageUrls + ", properties=" + properties
				+ "]";
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = super.hashCode();
		result = prime * result
				+ ((features == null) ? 0 : features.hashCode());
		result = prime * result
				+ ((imageUrls == null) ? 0 : imageUrls.hashCode());
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
		if (imageUrls == null) {
			if (other.imageUrls != null)
				return false;
		} else if (!imageUrls.equals(other.imageUrls))
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
