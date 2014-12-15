package io.riots.services.core;

import io.riots.services.core.SemanticType.SemanticDeviceType;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * Represents the "type" of a {@link Thing}
 * 
 * @author Waldemar Hummer
 * @author riox
 */
public class ThingType extends HierarchicalObject<ThingType> {

	@JsonInclude(Include.NON_EMPTY)
	private Manufacturer manufacturer;

	/**
	 * Semantic type of this device, e.g., temperature sensor.
	 */
	@JsonProperty("type")
	private SemanticDeviceType semanticType;

	@JsonInclude(Include.NON_EMPTY)
	private Map<String, String> features = new HashMap<>();

	@JsonInclude(Include.NON_EMPTY)
	private List<String> tags = new LinkedList<String>();

	@JsonProperty("image-urls")
	@JsonInclude(Include.NON_EMPTY)
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
	private List<Property<?>> properties = new LinkedList<Property<?>>();

	public ThingType() {
	}

	public ThingType(String name) {
		super(name);
	}

	public ThingType withManufacturer(final Manufacturer manufacturer) {
		this.manufacturer = manufacturer;
		return this;
	}

	public Manufacturer getManufacturer() {
		return manufacturer;
	}

	public void setManufacturer(Manufacturer manufacturer) {
		this.manufacturer = manufacturer;
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

	public SemanticDeviceType getSemanticType() {
		return semanticType;
	}

	public void setSemanticType(SemanticDeviceType semanticType) {
		this.semanticType = semanticType;
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
		return "ThingType [manufacturer=" + manufacturer + ", semanticType="
				+ semanticType + ", features=" + features + ", tags=" + tags
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
				+ ((manufacturer == null) ? 0 : manufacturer.hashCode());
		result = prime * result
				+ ((properties == null) ? 0 : properties.hashCode());
		result = prime * result
				+ ((semanticType == null) ? 0 : semanticType.hashCode());
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
		if (manufacturer == null) {
			if (other.manufacturer != null)
				return false;
		} else if (!manufacturer.equals(other.manufacturer))
			return false;
		if (properties == null) {
			if (other.properties != null)
				return false;
		} else if (!properties.equals(other.properties))
			return false;
		if (semanticType == null) {
			if (other.semanticType != null)
				return false;
		} else if (!semanticType.equals(other.semanticType))
			return false;
		if (tags == null) {
			if (other.tags != null)
				return false;
		} else if (!tags.equals(other.tags))
			return false;
		return true;
	}

	

}
