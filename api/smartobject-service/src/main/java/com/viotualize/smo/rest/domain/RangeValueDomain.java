package com.viotualize.smo.rest.domain;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("range")
public class RangeValueDomain extends ValueDomain {
	
	private long min;
	private long max;
	private String unit;
	private long step;
	
	public RangeValueDomain() {
		// nothing to do
	}
	
	public long getMin() {
		return this.min;
	}
	public void setMin(long min) {
		this.min = min;
	}
	public long getMax() {
		return this.max;
	}
	public void setMax(long max) {
		this.max = max;
	}
	public String getUnit() {
		return this.unit;
	}
	public void setUnit(String unit) {
		this.unit = unit;
	}
	public long getStep() {
		return this.step;
	}
	public void setStep(long step) {
		this.step = step;
	}

}
