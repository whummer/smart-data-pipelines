package io.riots.services.model;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("fixed")
public class FixedValueDomain extends ValueDomain {
	
	private long value;
	
	public FixedValueDomain() {
		// nothing to do
	}

	public long getValue() {
		return value;
	}

	public void setValue(long value) {
		this.value = value;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((this.unit == null) ? 0 : this.unit.hashCode());
		result = prime * result + (int) (this.value ^ (this.value >>> 32));
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) return true;
		if (obj == null) return false;
		if (getClass() != obj.getClass()) return false;
		FixedValueDomain other = (FixedValueDomain) obj;
		if (this.unit == null) {
			if (other.unit != null) return false;
		} else if (!this.unit.equals(other.unit)) return false;
		if (this.value != other.value) return false;
		return true;
	}

	@Override
	public String toString() {
		return "FixedValueDomain [value=" + this.value + ", unit=" + this.unit
				+ "]";
	}
 
	
}
