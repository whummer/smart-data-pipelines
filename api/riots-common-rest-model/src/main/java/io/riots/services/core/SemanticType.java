package io.riots.services.core;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Abstract class for meta information.
 * 
 * @author Waldemar Hummer
 */
@JsonSubTypes({
	@Type(value = SemanticType.SemanticDeviceType.class, name=SemanticType.CATEGORY_DEVICE),
	@Type(value = SemanticType.SemanticPropertyType.class, name=SemanticType.CATEGORY_PROPERTY)
})
@JsonTypeInfo(
		use = JsonTypeInfo.Id.NAME,
		include = JsonTypeInfo.As.PROPERTY,
		property = "category"
)
public class SemanticType {
	
	public static final String CATEGORY_PROPERTY = "Property";
	public static final String CATEGORY_DEVICE = "Device";
	
	private String id;
	private String name;
	
	@JsonIgnore
	private String category;
	
	public SemanticType() {}
	
	public SemanticType(String name) {
		this.setName(name);
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

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}
	

	/**
	 * Semantic types of properties, e.g., temperature, location, etc.
	 * 
	 * TODO: maybe use an existing schema, e.g., https://iotdb.org
	 * 
	 * @author whummer
	 */
	public static class SemanticPropertyType extends SemanticType {
		{
			setCategory(SemanticPropertyType.CATEGORY_PROPERTY);
		}

		public static enum PredefinedPropTypes {
			__none__,
			location, location_lat, location_lon,
			altitude,
			temperature,
			acceleration,
			velocity,
			activation, 
			battery_level, 
			network_delay,
			pressure,
			motion
		}
		
		public SemanticPropertyType() {}
		public SemanticPropertyType(String name) {
			this.setName(name);
		}
		
		public boolean isType(PredefinedPropTypes type) {
			return type.name().equals(getName());
		}
	}

	/**
	 * Semantic types of devices, e.g., temperature sensor, crane, ...
	 *
	 * @author hummer
	 */
	public static class SemanticDeviceType extends SemanticType {
		{
			setCategory(SemanticType.CATEGORY_DEVICE);
		}

		public static enum PredefinedDevTypes {
			__none__,
			Temperature_Sensor,
			Motion_Detector,
			Location_Sensor
		}
		
		public SemanticDeviceType() {}
		public SemanticDeviceType(String name) {
			this.setName(name);
		}
	}

	@Override
	public int hashCode() {
		return category.hashCode() + getName().hashCode();
	}

	@Override
	public boolean equals(Object o) {
		if(!(o instanceof SemanticType)) {
			return false;
		}
		return getName().equals(((SemanticType)o).getName()) &&
				getCategory().equals(((SemanticType)o).getCategory());
	}

}
