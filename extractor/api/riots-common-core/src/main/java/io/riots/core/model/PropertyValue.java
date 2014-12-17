package io.riots.core.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents the concrete value of a {@link Property}.
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_PROPERTY_VALUES)
public class PropertyValue<T> {

    @Id
    String id;

    @DBRef
	Property<T> property;

	T value;

	double timestamp;

	public PropertyValue() {}
	public PropertyValue(T value) {
		this(null, value);
	}
	public PropertyValue(Property<T> property, T value) {
		this.property = property;
		this.value = value;
	}

	public Property<T> getProperty() {
		return property;
	}
	public void setProperty(Property<T> property) {
		this.property = property;
	}
	public T getValue() {
		return value;
	}
	public void setValue(T value) {
		this.value = value;
	}
	public double getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(double timestamp) {
		this.timestamp = timestamp;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}

	@Override
	public String toString() {
		return "PropVal[" + property + "=" + value + "]";
	}
}
