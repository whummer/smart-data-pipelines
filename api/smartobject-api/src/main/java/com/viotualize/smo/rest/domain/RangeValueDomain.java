package com.viotualize.smo.rest.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("range")
public class RangeValueDomain extends ValueDomain {

	private long min;
	private long max;
	
  @JsonInclude(Include.NON_DEFAULT)
	private long step = 0; // 0 means unset 

	public RangeValueDomain() {
		// nothing to do
	}

	public RangeValueDomain(long min, long max, String unit, long step) {
		this.min = min;
		this.max = max;
		this.unit = unit;
		this.step = step;
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

	public long getStep() {
		return this.step;
	}

	public void setStep(long step) {
		this.step = step;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + (int) (this.max ^ (this.max >>> 32));
		result = prime * result + (int) (this.min ^ (this.min >>> 32));
		result = prime * result + (int) (this.step ^ (this.step >>> 32));
		result = prime * result + ((this.unit == null) ? 0 : this.unit.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) return true;
		if (obj == null) return false;
		if (getClass() != obj.getClass()) return false;
		RangeValueDomain other = (RangeValueDomain) obj;
		if (this.max != other.max) return false;
		if (this.min != other.min) return false;
		if (this.step != other.step) return false;
		if (this.unit == null) {
			if (other.unit != null) return false;
		} else if (!this.unit.equals(other.unit)) return false;
		return true;
	}

	@Override
	public String toString() {
		return "RangeValueDomain [min=" + this.min + ", max=" + this.max
				+ ", step=" + this.step + "]";
	}

}
