package io.riots.services.core;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * A {@link Thing} represents a real-world IoT entity (device, sensor, golf club car with sensors, etc). 
 * Each {@link Thing} has an {@link ThingType}.
 * 
 * @author Waldemar Hummer
 * @author riox
 */
public class Thing extends HierarchicalObject<Thing> {
	
	@JsonProperty("thing-type")
	private ThingType thingType;
	
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

    public Location getLocation() {
		return location;
	}
    public void setLocation(Location location) {
		this.location = location;
	}
    public ThingType getThingType() {
		return thingType;
	}
    public void setAssetType(ThingType thingType) {
		 this.thingType = thingType;
	}
    public Object getGeometry() {
		return geometry;
	}
    public void setGeometry(Object geometry) {
		this.geometry = geometry;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = super.hashCode();
		result = prime * result
				+ ((geometry == null) ? 0 : geometry.hashCode());
		result = prime * result
				+ ((location == null) ? 0 : location.hashCode());
		result = prime * result
				+ ((thingType == null) ? 0 : thingType.hashCode());
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
		if (geometry == null) {
			if (other.geometry != null)
				return false;
		} else if (!geometry.equals(other.geometry))
			return false;
		if (location == null) {
			if (other.location != null)
				return false;
		} else if (!location.equals(other.location))
			return false;
		if (thingType == null) {
			if (other.thingType != null)
				return false;
		} else if (!thingType.equals(other.thingType))
			return false;
		return true;
	}

	

   
}
