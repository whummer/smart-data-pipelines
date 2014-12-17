package io.riots.services.catalog;


/**
 * Represents the concrete value of a {@link Property}, 
 * e.g., an {@link EventProperty} within an {@link Event}.
 * 
 * @author Waldemar Hummer
 */
public class PropertyValue<T> {

	Property<T> property;

	T value;

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


	@Override
	public String toString() {
		return "PropVal[" + property + "=" + value + "]";
	}
}
