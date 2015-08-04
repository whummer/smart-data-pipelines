package io.riots.api.services.catalog;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * @author omoser
 * @author whummer
 * @author riox
 */
public class Manufacturer {

	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String id;

	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String name;

	public Manufacturer() {
	}

	public Manufacturer(String name) {
		setName(name);
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Manufacturer withId(final String id) {
		this.id = id;
		return this;
	}

	public Manufacturer withName(final String name) {
		this.name = name;
		return this;
	}

	@Override
	public String toString() {
		return "Manufacturer{" +
				"id='" + id + '\'' +
				", name='" + name + '\'' +
				'}';
	}
}
