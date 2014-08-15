package com.viotualize.smo.rest.domain;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SmartObject {
	
	private String id;
	private String name;
	private String description;
	private String type;
	private String manufacturer;
	private List<String> tags;
	
	@JsonProperty("dynamic-properties")
	private Map<String, ValueDomain> dynamicProperties;
	
	@JsonProperty("static-properties")
	private Map<String, Map<String, String>> staticProperties;
	
	@JsonProperty("smartobjects")
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

	public Map<String, ValueDomain> getDynamicProperties() {
		return this.dynamicProperties;
	}

	public void setDynamicProperties(Map<String, ValueDomain> properties) {
		this.dynamicProperties = properties;
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
	
}
