package io.riots.services.catalog;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Parent;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author omoser
 * @author riox
 */
@SuppressWarnings("unchecked")
public abstract class BaseObject<T> {

	@JsonInclude(Include.NON_EMPTY) 
	@Id
	private String id;
	
	@JsonIgnore
	@Parent(type = "thing-type")
	private String parentId;

	@JsonInclude(Include.NON_EMPTY) 
	private String name;
	
	@JsonInclude(Include.NON_EMPTY) 
	private String description;
	
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creation-date")
	@Field(type = FieldType.Date)
	private Date created;
	
	@JsonInclude(Include.NON_EMPTY) 
	@JsonProperty("creator-id")
	private String creatorId;
	
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

	public String getCreatorId() {
		return creatorId;
	}

	public void setCreator(String creatorId) {
		this.creatorId = creatorId;
	}
	
	public String getParentId() {
		return parentId;
	}

	public void setParentId(String parentId) {
		this.parentId = parentId;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((created == null) ? 0 : created.hashCode());
		result = prime * result + ((creatorId == null) ? 0 : creatorId.hashCode());
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
		if (creatorId == null) {
			if (other.creatorId != null)
				return false;
		} else if (!creatorId.equals(other.creatorId))
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
