package io.riots.services.core;

/**
 * @author omoser
 * @author whummer
 * @author riox
 */
public class Manufacturer {

	private String id;
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

}
