package com.viotualize.core.domain;

import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a user role.
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_ROLES)
public class Role extends BaseObject<Role> {

	public static final String ROLE_ADMIN = "admin";
	public static final String ROLE_USER = "user";
	public static final String ROLE_GUEST = "guest";

	public static final String[] ROLES = {
		Role.ROLE_ADMIN, Role.ROLE_USER, Role.ROLE_GUEST
	};

	public Role() {
		super(null);
	}
	public Role(String name) {
		super(name);
	}

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	@Override
	public String toString() {
		return "Role [name=" + name + "]";
	}

}
