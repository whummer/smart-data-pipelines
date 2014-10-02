package io.riots.core.model;

import org.springframework.data.mongodb.core.mapping.Document;

/**
 * @author omoser
 */

@Document(collection = Constants.COLL_DEVICES)
public class Device extends CompositeObject<Device> {

    double[] location;

    DeviceType deviceType;

    public Device() {
        super();
    }

    public Device(String name) {
        super(name);
    }

    public Device withDeviceType(final DeviceType deviceType) {
        return this;
    }

    public Device withLocation(final double[] location) {
        this.location = location;
        return this;
    }

    public double[] getLocation() {
        return location;
    }

    public DeviceType getDeviceType() {
        return deviceType;
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
