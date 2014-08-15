package com.viotualize.smo.rest.domain;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("fixed")
public class FixedValueDomain extends ValueDomain {

	private long value;
	private String unit;

	public FixedValueDomain() {
		// nothing to do
	}

	public String getUnit() {
		return this.unit;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	public long getValue() {
		return value;
	}

	public void setValue(long value) {
		this.value = value;
	}

}
