package io.riots.api.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.model.Device;
import io.riots.core.repositories.DeviceRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
// todo generify command handlers
@Component
public class DeviceCommand {

    static final Logger log = LoggerFactory.getLogger(DeviceCommand.class);

    @Autowired
    DeviceRepository repository;

    public Device create(Device device) {
        log.debug(Markers.COMMAND, "Persisting Device {}", device);
        return repository.save(device);
    }

    public Device update(Device device) {
        log.debug(Markers.COMMAND, "Updating Device {}", device);
        return repository.save(device);
    }

    public void delete(String deviceId) {
        repository.delete(deviceId);
    }
}
