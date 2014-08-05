package com.viotualize.core.domain;

import java.util.LinkedList;
import java.util.List;

import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a user in the system.
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_USERS)
public class User extends BaseObject<User> {

	String password;

	List<Role> roles = new LinkedList<Role>();

	public User() {}
	public User(String name, String password) {
		super(name);
		this.password = password;
	}

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public List<Role> getRoles() {
		return roles;
	}
	@Override
	public String toString() {
		return "User [name=" + name + ", password=" + password + ", roles="
				+ roles + "]";
	}
}
