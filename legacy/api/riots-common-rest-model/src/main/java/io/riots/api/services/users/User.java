package io.riots.api.services.users;

import io.riots.api.services.model.Constants;
import io.riots.api.services.model.interfaces.ObjectCreated;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import org.springframework.util.StringUtils;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * Represents a user in the system.
 * 
 * @author Waldemar Hummer
 */
public class User implements ObjectIdentifiable, ObjectCreated {

	/**
	 * Unique identifier.
	 */
	@JsonProperty
	private String id;
	/**
	 * Creating user.
	 */
	@JsonProperty(Constants.CREATION_DATE)
	@JsonInclude(Include.NON_EMPTY)
	private Date created;
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
	/**
	 * Roles assigned to this user.
	 */
	@JsonIgnore
	private List<Role> roles = new LinkedList<Role>();

	public User() {}
	public User(String email) {
		this.email = email;
	}
	public User(RequestSignupUser r) {
		this.copyFrom(r);
	}

	protected void copyFrom(User user) {
		this.setId(user.getId());
		this.setAddress(user.getAddress());
		this.setBirthDate(user.getBirthDate());
		this.setEmail(user.getEmail());
		this.setFirstname(user.getFirstname());
		this.setLastname(user.getLastname());
		this.getRoles().addAll(user.getRoles());
	}

	@JsonIgnore
	public String getDisplayName() {
		if(!StringUtils.isEmpty(getFirstname()) && !StringUtils.isEmpty(getLastname())) {
			return getFirstname() + " " + getLastname();
		} else if(StringUtils.isEmpty(getFirstname())) {
			return getFirstname();
		} else if(StringUtils.isEmpty(getLastname())) {
			return getLastname();
		}
		return null;
	}
	@JsonIgnore
	public String getDisplayName(String defaultName) {
		String name = getDisplayName();
		if(StringUtils.isEmpty(name)) {
			return defaultName;
		}
		return name;
	}

	public Date getCreated() {
		return created;
	}
	public void setCreated(Date created) {
		this.created = created;
	}
	@JsonIgnore
	public String getCreatorId() {
		return null; /* no explicit creator used */
	}
	public String getEmail() {
		return email;
	}
	public String getId() {
		return id;
	}
	public List<Role> getRoles() {
		return roles;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getFirstname() {
		return firstname;
	}
	public void setFirstname(String firstname) {
		this.firstname = firstname;
	}
	public String getLastname() {
		return lastname;
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
	public void setAddress(Address address) {
		this.address = address;
	}
	public String getBirthDate() {
		return birthDate;
	}
	public void setBirthDate(String birthDate) {
		this.birthDate = birthDate;
	}

	@Override
	public String toString() {
		return "User [email=" + email + ",roles=" + roles + "]";
	}
}
