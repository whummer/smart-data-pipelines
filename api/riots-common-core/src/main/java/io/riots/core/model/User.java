package io.riots.core.model;

import java.util.LinkedList;
import java.util.List;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a user in the system.
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_USERS)
public class User extends BaseObject<User> {

	String email;

	@DBRef
	List<Role> roles = new LinkedList<Role>();

	public String getName() {
		return name;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public void setName(String name) {
		this.name = name;
	}
	public List<Role> getRoles() {
		return roles;
	}
	@Override
	public String toString() {
		return "User [name=" + name + ",email=" + email + ",roles=" + roles + "]";
	}
}
