package io.riots.services.model;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

/* TODO revise/remove? */
public class SmartObject {
	
	@JsonProperty(required=false)
	@JsonInclude(Include.NON_NULL)
	private String id;
	private String name;
	private String description;
	private String type;
	private String manufacturer;
	private List<String> tags;
	
	@JsonProperty("dynamic-properties")
	private Map<String, Object> dynamicProperties;
	
	@JsonProperty("static-properties")
	private Map<String, Map<String, String>> staticProperties;
	
	@JsonProperty("smartobjects")
	@JsonInclude(Include.NON_NULL)
	private List<SmartObject> smartObjects;
	
	public SmartObject() {
		// nothing to do
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

	public String getType() {
		return this.type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getManufacturer() {
		return this.manufacturer;
	}

	public void setManufacturer(String manufacturer) {
		this.manufacturer = manufacturer;
	}

	public List<String> getTags() {
		return this.tags;
	}

	public void setTags(List<String> tags) {
		this.tags = tags;
	}

	
	public List<SmartObject> getSmartObjects() {
		return this.smartObjects;
	}

	public void setSmartObjects(List<SmartObject> smartObjects) {
		this.smartObjects = smartObjects;
	}

	public Map<String, Map<String, String>> getStaticProperties() {
		return staticProperties;
	}

	public void setStaticProperties(Map<String, Map<String, String>> staticProperties) {
		this.staticProperties = staticProperties;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((this.description == null) ? 0 : this.description.hashCode());
		result = prime
				* result
				+ ((this.dynamicProperties == null) ? 0 : this.dynamicProperties
						.hashCode());
		result = prime * result + ((this.id == null) ? 0 : this.id.hashCode());
		result = prime * result
				+ ((this.manufacturer == null) ? 0 : this.manufacturer.hashCode());
		result = prime * result + ((this.name == null) ? 0 : this.name.hashCode());
		result = prime * result
				+ ((this.smartObjects == null) ? 0 : this.smartObjects.hashCode());
		result = prime
				* result
				+ ((this.staticProperties == null) ? 0 : this.staticProperties
						.hashCode());
		result = prime * result + ((this.tags == null) ? 0 : this.tags.hashCode());
		result = prime * result + ((this.type == null) ? 0 : this.type.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) return true;
		if (obj == null) return false;
		if (getClass() != obj.getClass()) return false;
		SmartObject other = (SmartObject) obj;
		if (this.description == null) {
			if (other.description != null) return false;
		} else if (!this.description.equals(other.description)) return false;
		if (this.dynamicProperties == null) {
			if (other.dynamicProperties != null) return false;
		} else if (!this.dynamicProperties.equals(other.dynamicProperties)) return false;
		if (this.id == null) {
			if (other.id != null) return false;
		} else if (!this.id.equals(other.id)) return false;
		if (this.manufacturer == null) {
			if (other.manufacturer != null) return false;
		} else if (!this.manufacturer.equals(other.manufacturer)) return false;
		if (this.name == null) {
			if (other.name != null) return false;
		} else if (!this.name.equals(other.name)) return false;
		if (this.smartObjects == null) {
			if (other.smartObjects != null) return false;
		} else if (!this.smartObjects.equals(other.smartObjects)) return false;
		if (this.staticProperties == null) {
			if (other.staticProperties != null) return false;
		} else if (!this.staticProperties.equals(other.staticProperties)) return false;
		if (this.tags == null) {
			if (other.tags != null) return false;
		} else if (!this.tags.equals(other.tags)) return false;
		if (this.type == null) {
			if (other.type != null) return false;
		} else if (!this.type.equals(other.type)) return false;
		return true;
	}
	
	
	
}
