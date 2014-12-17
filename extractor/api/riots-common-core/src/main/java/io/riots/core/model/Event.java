package io.riots.core.model;

import java.util.Collection;
import java.util.Date;

import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents an event, i.e., any happening of interest in the system.
 * 
 * Typically, an event represents a state change in the world.
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_EVENTS)
public class Event {

	Date time;

	Collection<PropertyValue<?>> values;

	public Date getTime() {
		return time;
	}
	public void setTime(Date time) {
		this.time = time;
	}
	public Collection<PropertyValue<?>> getSensings() {
		return values;
	}
}
