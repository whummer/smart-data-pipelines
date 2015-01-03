package io.riots.services.users;

import java.util.LinkedList;
import java.util.List;

/**
 * Represents a user in the system.
 * 
 * @author Waldemar Hummer
 */
public class User {

	private String id;
	private String email;
	private String firstname;
	private String lastname;
	private String name;

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
	public String getName() {
		return name;
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
	public void setName(String name) {
		this.name = name;
	}
	public void setId(String id) {
		this.id = id;
	}

	@Override
	public String toString() {
		return "User [name=" + name + ",email=" + email + ",roles=" + roles
				+ "]";
	}
}