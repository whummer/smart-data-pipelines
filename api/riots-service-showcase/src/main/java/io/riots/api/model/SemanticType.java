package io.riots.api.model;

import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Abstract class for meta information.
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_BASEOBJECT_CATEGORIZED)
@JsonSubTypes({
	@Type(value = SemanticType.SemanticDeviceType.class, name=SemanticType.CATEGORY_DEVICE),
	@Type(value = SemanticType.SemanticPropertyType.class, name=SemanticType.CATEGORY_PROPERTY)
})
@JsonTypeInfo(
		use = JsonTypeInfo.Id.NAME,
		include = JsonTypeInfo.As.PROPERTY,
		property = "category"
)
public class SemanticType extends BaseObjectCategorized<SemanticType> {

	/**
	 * Semantic types of properties, e.g., temperature, location, etc.
	 * 
	 * TODO: maybe use an existing schema, e.g., https://iotdb.org
	 * 
	 * @author whummer
	 */
	public static class SemanticPropertyType extends SemanticType {
		{
			category = SemanticType.CATEGORY_PROPERTY;
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
			this.name = name;
		}
		
		public boolean isType(PredefinedPropTypes type) {
			return type.name().equals(name);
		}
	}

	/**
	 * Semantic types of devices, e.g., temperature sensor, crane, ...
	 *
	 * @author hummer
	 */
	public static class SemanticDeviceType extends SemanticType {
		{
			category = SemanticType.CATEGORY_DEVICE;
		}

		public static enum PredefinedDevTypes {
			__none__,
			Temperature_Sensor,
			Motion_Detector,
			Location_Sensor
		}
		
		public SemanticDeviceType() {}
		public SemanticDeviceType(String name) {
			this.name = name;
		}
	}

	@Override
	public int hashCode() {
		return category.hashCode() + name.hashCode();
	}

	@Override
	public boolean equals(Object o) {
		if(!(o instanceof SemanticType)) {
			return false;
		}
		return name.equals(((SemanticType)o).name) &&
				category.equals(((SemanticType)o).category);
	}

}
