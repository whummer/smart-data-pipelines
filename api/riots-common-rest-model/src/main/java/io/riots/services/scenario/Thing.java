package io.riots.services.scenario;

import io.riots.services.catalog.HierarchicalObject;
import io.riots.services.catalog.ThingType;
import io.riots.services.model.Location;
import io.riots.services.model.interfaces.ObjectCreated;
import io.riots.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;

import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * A {@link Thing} represents a real-world IoT entity (device, sensor, golf club car with sensors, etc). 
 * Each {@link Thing} has an {@link ThingType}.
 * 
 * @author Waldemar Hummer
 * @author riox
 */
public class Thing extends HierarchicalObject<String> implements ObjectCreated, ObjectIdentifiable {
	
	@JsonProperty
	private String id;

	@JsonProperty("thing-type")
	private String thingTypeId;

	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creation-date")
	@Field(type = FieldType.Date)
	private Date created;

	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creator-id")
	private String creatorId;

    /**
	 * Location of this thing.
	 */
    private Location location;
    
    /**
     * The 3D geometry associated with this asset/thing.
     */
    // TODO: this should be removed
    private Object geometry;
    
    public Thing() {}

    public Thing(String name) {
        super(name);
    }
    
    public Thing withLocation(final Location location) {
        this.location = location;
        return this;
    }

    public String getId() {
		return id;
	}
    public void setId(String id) {
    	this.id = id;
    }
    public Location getLocation() {
		return location;
	}
    public void setLocation(Location location) {
		this.location = location;
	}
	public String getThingTypeId() {
		return thingTypeId;
	}
	public void setThingTypeId(String thingTypeId) {
		this.thingTypeId = thingTypeId;
	}
    public Object getGeometry() {
		return geometry;
	}
    public void setGeometry(Object geometry) {
		this.geometry = geometry;
	}
    public Date getCreated() {
    	return created;
    }
    public void setCreated(Date created) {
		this.created = created;
	}
    public String getCreatorId() {
    	return creatorId;
    }
    public void setCreatorId(String creatorId) {
		this.creatorId = creatorId;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = super.hashCode();
		result = prime * result
				+ ((name == null) ? 0 : name.hashCode());
		result = prime * result
				+ ((location == null) ? 0 : location.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (!super.equals(obj))
			return false;
		if (getClass() != obj.getClass())
			return false;
		Thing other = (Thing) obj;
		if (name == null) {
			if (other.name != null)
				return false;
		} else if (!name.equals(other.name))
			return false;
		if (location == null) {
			if (other.location != null)
				return false;
		} else if (!location.equals(other.location))
			return false;
		return true;
	}

}
