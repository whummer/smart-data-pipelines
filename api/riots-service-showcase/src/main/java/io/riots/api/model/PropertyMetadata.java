package io.riots.api.model;

/**
 * Encapsulates metadata information for properties.
 * 
 * @author Waldemar Hummer
 */
public class PropertyMetadata {

	/**
	 * Whether a property is readable/sensable
	 */
	Boolean sensable;
	/**
	 * Whether a property is modifyable/actuatable
	 */
	Boolean actuatable;
	
	public Boolean isSensable() {
		return sensable;
	}
	public PropertyMetadata setSensable(Boolean sensable) {
		this.sensable = sensable;
		return this;
	}
	public Boolean isActuatable() {
		return actuatable;
	}
	public PropertyMetadata setActuatable(Boolean actuatable) {
		this.actuatable = actuatable;
		return this;
	}
}
