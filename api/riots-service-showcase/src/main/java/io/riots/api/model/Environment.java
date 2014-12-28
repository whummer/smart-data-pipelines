package io.riots.api.model;

import io.riots.services.scenario.Thing;

import java.util.HashSet;
import java.util.Set;

import org.springframework.data.mongodb.core.mapping.Document;

/**
 * @author omoser
 */
@Document(collection = Constants.COLL_ENVIRONMENTS)
public class Environment extends BaseObject<Environment> {

    private Set<Thing> devices = new HashSet<>();

    public Environment(String name) {
        super(name);
    }

    public Set<Thing> getDevices() {
        return devices;
    }

    public void setDevices(Set<Thing> devices) {
        this.devices = devices;
    }

    public Environment withDevices(final Set<Thing> devices) {
        this.devices = devices;
        return this;
    }

    public Environment addDevice(final Thing device) {
        devices.add(device);
        return this;
    }

}
