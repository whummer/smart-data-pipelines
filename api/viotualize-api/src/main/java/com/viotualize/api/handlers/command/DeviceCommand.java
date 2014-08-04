package com.viotualize.api.handlers.command;

import com.viotualize.core.domain.Device;
import com.viotualize.core.domain.DeviceType;
import com.viotualize.core.logging.Markers;
import com.viotualize.core.repositories.DeviceRepository;
import com.viotualize.core.repositories.DeviceTypeRepository;
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

    static final Logger log = LoggerFactory.getLogger(DeviceTypeCommand.class);

    @Autowired
    DeviceRepository repository;

    public Device create(Device device) {
        log.debug(Markers.COMMAND, "Persisting Device {}", device);
        return repository.save(device);
    }

    public Device update(Device device) {
        log.debug(Markers.COMMAND, "Updating DeviceType {}", device);
        return repository.save(device);
    }

    public void delete(String deviceId) {
        repository.delete(deviceId);
    }
}
