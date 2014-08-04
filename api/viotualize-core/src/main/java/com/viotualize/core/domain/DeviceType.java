package com.viotualize.core.domain;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * @author omoser
 */

@Document(collection = "device_types")
public class DeviceType extends SmartObject<DeviceType> {

    public enum Type {CONTAINER, SENSOR, ACTUATOR}

    @DBRef
    private Manufacturer manufacturer;

    private Type type;

    protected DeviceType(String name) {
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
}
