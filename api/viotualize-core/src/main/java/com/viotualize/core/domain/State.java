package com.viotualize.core.domain;

import java.util.Date;

/**
 * Represents a state of a property at a given time.
 * 
 * @author Waldemar Hummer
 */
// TODO: needed? integrate into the model..
public class State {

	private Date time;
	private Object value;

	public Object getValue() {
		return value;
	}

	public void setValue(Object value) {
		this.value = value;
	}

	public Date getTime() {
		return time;
	}

	public void setTime(Date time) {
		this.time = time;
	}
}
