package io.riots.catalog.model;

import static org.springframework.data.elasticsearch.annotations.FieldType.Object;
import static org.springframework.data.elasticsearch.annotations.FieldType.String;
import io.riots.services.catalog.Property;
import io.riots.services.catalog.ThingType;
import io.riots.services.scenario.Thing;

import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

/**
 * Represents the "type" of a {@link Thing}
 * 
 * @author Waldemar Hummer
 * @author riox
 */
@Document(indexName = "thing-types", type = "thing", shards = 1, replicas = 0, refreshInterval = "-1", indexStoreType = "memory")
public class ThingTypeElastic extends
		HierarchicalObjectElastic<ThingTypeElastic> {

	@Id
	private String id;

	private String description;

	@Field(type = FieldType.Date)
	private Date created;

	private String creatorId;

	private String manufacturerId;

	@Field(type = String, store = true)
	private Map<String, String> features = new HashMap<>();

	@Field(type = String, store = true)
	private List<String> tags = new LinkedList<String>();

	@Field(type = String, store = true)
	private List<String> imageUrls;

	/**
	 * Contains the list of properties that are "actuatable" within this device.
	 * Actuatable properties are either 1) sensable properties reported by a
	 * sensor device (e.g., room temperature), or 2) actuatable properties
	 * (e.g., temperature of a heater). A property can also be both sensable and
	 * actuatable.
	 */
	@Field(type = Object, store = true)
	private List<PropertyElastic> properties = new LinkedList<PropertyElastic>();

	public ThingTypeElastic() {
	}

	public ThingTypeElastic(String name) {
		super(name);
	}

	public ThingTypeElastic(ThingType t) {
		BeanUtils.copyProperties(t, this);
		
		properties = new LinkedList<PropertyElastic>();
		for (Property p : t.getProperties()) {
			this.addProperty(new PropertyElastic(p));
		}		
	}

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

	public void setCreator(String creatorId) {
		this.creatorId = creatorId;
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

	public List<PropertyElastic> getProperties() {
		return properties;
	}

	public void setProperties(List<PropertyElastic> properties) {
		this.properties = properties;
	}

	private void addProperty(PropertyElastic property) {
		properties.add(property);
	}

	public ThingTypeElastic addFeature(final String key, final String value) {
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
		return "ThingType [manufacturer=" + manufacturerId
				+ ", features=" + features + ", tags=" + tags + ", imageUrls="
				+ imageUrls + ", properties=" + properties + "]";
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
		ThingTypeElastic other = (ThingTypeElastic) obj;
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
