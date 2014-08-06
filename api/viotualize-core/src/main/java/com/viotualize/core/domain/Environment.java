package com.viotualize.core.domain;

import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

/**
 * @author omoser
 */
@Document(collection = Constants.COLL_ENVIRONMENTS)
public class Environment extends BaseObject<Environment> {

    private Set<Device> devices = new HashSet<>();

    public Environment(String name) {
        super(name);
    }

    public Set<Device> getDevices() {
        return devices;
    }

    public void setDevices(Set<Device> devices) {
        this.devices = devices;
    }

    public Environment withDevices(final Set<Device> devices) {
        this.devices = devices;
        return this;
    }

    public Environment addDevice(final Device device) {
        devices.add(device);
        return this;
    }

}
