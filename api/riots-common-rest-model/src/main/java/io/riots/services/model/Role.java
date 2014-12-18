package io.riots.services.model;

/**
 * Represents a user role.
 * 
 * @author Waldemar Hummer
 */
public class Role {

	public static final String ROLE_ADMIN = "admin";
	public static final String ROLE_USER = "user";
	public static final String ROLE_GUEST = "guest";

	public static final String HAS_ROLE_ADMIN = "hasRole('" + Role.ROLE_ADMIN
			+ "')";
	public static final String HAS_ROLE_USER = "hasRole('" + Role.ROLE_USER
			+ "')";
	public static final String HAS_ROLE_GUEST = "hasRole('" + Role.ROLE_GUEST
			+ "')";

	public static final String[] ROLES = { Role.ROLE_ADMIN, Role.ROLE_USER,
			Role.ROLE_GUEST };

	private String id;
	private String name;

	public Role() {
	}

	public Role(String name) {
		this.name = name;
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

	@Override
	public String toString() {
		return "Role [name=" + name + "]";
	}

}
