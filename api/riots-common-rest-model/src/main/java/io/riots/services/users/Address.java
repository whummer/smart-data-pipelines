package io.riots.services.users;

/**
 * Represents a physical postal address.
 * @author whummer
 */
public class Address {

	/**
	 * Street address.
	 */
	String street;
	/**
	 * Street address (line 2).
	 */
	String streetLine2;
	/**
	 * Post code.
	 */
	String postCode;
	/**
	 * City.
	 */
	String city;
	/**
	 * Country.
	 */
	String country;

	public String getCity() {
		return city;
	}
	public String getCountry() {
		return country;
	}
	public String getPostCode() {
		return postCode;
	}
	public String getStreet() {
		return street;
	}
	public String getStreetLine2() {
		return streetLine2;
	}
}
