package com.viotualize.smo.rest.domain;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeInfo.Id;
import com.fasterxml.jackson.annotation.JsonTypeInfo.As;

@JsonTypeInfo(use=Id.NAME, include=As.PROPERTY, property="type")
@JsonSubTypes({
  @JsonSubTypes.Type(value=RangeValueDomain.class, name="range"),
  @JsonSubTypes.Type(value=FixedValueDomain.class, name="fixed")
}) 
public abstract class ValueDomain {

	protected String unit;

	public String getUnit() {
		return this.unit;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((this.unit == null) ? 0 : this.unit.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) return true;
		if (obj == null) return false;
		if (getClass() != obj.getClass()) return false;
		ValueDomain other = (ValueDomain) obj;
		if (this.unit == null) {
			if (other.unit != null) return false;
		} else if (!this.unit.equals(other.unit)) return false;
		return true;
	}
	
}
