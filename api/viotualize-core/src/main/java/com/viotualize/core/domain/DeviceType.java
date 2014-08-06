package com.viotualize.core.domain;

import com.fasterxml.jackson.annotation.JsonCreator;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * @author omoser
 */

@Document(collection = Constants.COLL_DEVICE_TYPES)
public class DeviceType extends CompositeObject<DeviceType> {

    public enum Type {CONTAINER, SENSOR, ACTUATOR}

    @DBRef
    private Manufacturer manufacturer;

    private Type type;

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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DeviceType)) return false;
        if (!super.equals(o)) return false;

        DeviceType that = (DeviceType) o;

        if (manufacturer != null ? !manufacturer.equals(that.manufacturer) : that.manufacturer != null) return false;
        if (type != that.type) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (manufacturer != null ? manufacturer.hashCode() : 0);
        result = 31 * result + (type != null ? type.hashCode() : 0);
        return result;
    }
}
