package com.viotualize.core.domain;

/**
 * Encapsulates metadata information for properties.
 * 
 * @author Waldemar Hummer
 */
public class PropertyMetadata {

	Boolean sensable;

	Boolean actuatable;

	public Boolean isSensable() {
		return sensable;
	}
	public void setSensable(Boolean sensable) {
		this.sensable = sensable;
	}
	public Boolean isActuatable() {
		return actuatable;
	}
	public void setActuatable(Boolean actuatable) {
		this.actuatable = actuatable;
	}
}
