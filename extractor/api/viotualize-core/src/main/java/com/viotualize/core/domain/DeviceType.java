package com.viotualize.core.domain;

import java.util.LinkedList;
import java.util.List;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * @author omoser
 */

@Document(collection = Constants.COLL_DEVICE_TYPES)
public class DeviceType extends AssetType<DeviceType> {

    public enum Type {
    	CONTAINER, SENSOR, ACTUATOR
    }

    @DBRef
    private Manufacturer manufacturer;

    private Type type;

    /**
     * Contains the list of properties that are "actuatable"
     * within this device. Actuatable properties are either 1) 
     * sensable properties reported by a sensor device 
     * (e.g., room temperature), or 2) actuatable properties 
     * (e.g., temperature of a heater). A property can also 
     * be both sensable and actuatable.
     */
    private List<Property<?>> deviceProperties = new LinkedList<Property<?>>();

    @JsonCreator
    public DeviceType() {
        super();
    }

    public DeviceType(String name) {
        super(name);
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public DeviceType withType(final Type type) {
        this.type = type;
        return this;
    }

    public DeviceType withManufacturer(final Manufacturer manufacturer) {
        this.manufacturer = manufacturer;
        return this;
    }

    public Manufacturer getManufacturer() {
        return manufacturer;
    }

    public List<Property<?>> getDeviceProperties() {
		return deviceProperties;
	}

    public void setDeviceProperties(List<Property<?>> deviceProperties) {
		this.deviceProperties = deviceProperties;
	}

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DeviceType)) return false;
        if (!super.equals(o)) return false;

        DeviceType that = (DeviceType) o;

        if (manufacturer != null ? !manufacturer.equals(that.manufacturer) : that.manufacturer != null) return false;
        if (type != that.type) return false;
        if (deviceProperties.equals(that.deviceProperties)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (manufacturer != null ? manufacturer.hashCode() : 0);
        result = 31 * result + (type != null ? type.hashCode() : 0);
        result = 31 * result + (deviceProperties != null ? deviceProperties.hashCode() : 0);
        return result;
    }
}
