package io.riots.core.model;

import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author omoser
 */

@Document(collection = Constants.COLL_DEVICES)
public class Device extends Asset<Device,DeviceType> {

	public Device() {}

    public Device(String name) {
        super(name);
    }

    public Device withDeviceType(final DeviceType deviceType) {
        this.assetType = deviceType;
        return this;
    }

    @JsonIgnore
    public DeviceType getDeviceType() {
        return assetType;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Device)) return false;

        Device device = (Device) o;

        if (id != null ? !id.equals(device.id) : device.id != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
