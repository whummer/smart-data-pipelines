package io.riots.api.services.users;

import io.riots.api.services.model.interfaces.ObjectIdentifiable;

import java.util.LinkedList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents a user in the system.
 * 
 * @author Waldemar Hummer
 */
public class User implements ObjectIdentifiable {

	/**
	 * Unique identifier.
	 */
	@JsonProperty
	private String id;
	/**
	 * Email address.
	 */
	@JsonProperty
	private String email;
	/**
	 * First name (given name).
	 */
	@JsonProperty
	private String firstname;
	/**
	 * Last name (family name).
	 */
	@JsonProperty
	private String lastname;
	/**
	 * Address.
	 */
	@JsonProperty
	private Address address = new Address();
	/**
	 * Date of birth.
	 */
	@JsonProperty
	private String birthDate;

	private List<Role> roles = new LinkedList<Role>();

	public String getEmail() {
		return email;
	}
	public String getId() {
		return id;
	}
	public String getFirstname() {
		return firstname;
	}
	public String getLastname() {
		return lastname;
	}
	public List<Role> getRoles() {
		return roles;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public void setFirstname(String firstname) {
		this.firstname = firstname;
	}
	public void setLastname(String lastname) {
		this.lastname = lastname;
	}
	public void setId(String id) {
		this.id = id;
	}
	public Address getAddress() {
		return address;
	}
	public String getBirthDate() {
		return birthDate;
	}

	@Override
	public String toString() {
		return "User [email=" + email + ",roles=" + roles + "]";
	}
}
