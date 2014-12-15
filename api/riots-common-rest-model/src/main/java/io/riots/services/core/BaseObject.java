package io.riots.services.core;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * @author omoser
 * @author riox
 */
@SuppressWarnings("unchecked")
public abstract class BaseObject<T> {

	private String id;
	private String name;
	
	@JsonInclude(Include.NON_EMPTY) 
	private String description;
	
	@JsonInclude(Include.NON_EMPTY) 
	private Date created;
	
	@JsonInclude(Include.NON_EMPTY) 
	private User creator;
	
	/**	
	 * Default c'tor.
	 */
	public BaseObject() {
	}

	/**
	 * C'tor with name.
	 */
	public BaseObject(String name) {
		this.name = name;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getDescription() {
		return description;
	}
	
	public T withName(final String name) {
		this.name = name;
		return (T) this;
	}

	public T withDescription(final String description) {
		this.description = description;
		return (T) this;
	}
	
	public Date getCreated() {
		return created;
	}

	public T withCreated(final Date created) {
		this.created = created;
		return (T) this;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	public User getCreator() {
		return creator;
	}

	public T withCreator(final User creator) {
		this.creator = creator;
		return (T) this;
	}

	public void setCreator(User creator) {
		this.creator = creator;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((created == null) ? 0 : created.hashCode());
		result = prime * result + ((creator == null) ? 0 : creator.hashCode());
		result = prime * result
				+ ((description == null) ? 0 : description.hashCode());
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		result = prime * result + ((name == null) ? 0 : name.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		BaseObject<?> other = (BaseObject<?>) obj;		
		if (created == null) {
			if (other.created != null)
				return false;
		} else if (!created.equals(other.created))
			return false;
		if (creator == null) {
			if (other.creator != null)
				return false;
		} else if (!creator.equals(other.creator))
			return false;
		if (description == null) {
			if (other.description != null)
				return false;
		} else if (!description.equals(other.description))
			return false;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		if (name == null) {
			if (other.name != null)
				return false;
		} else if (!name.equals(other.name))
			return false;
		return true;
	}

}
