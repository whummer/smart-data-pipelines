package io.riots.api.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.model.DeviceType;
import io.riots.core.repositories.DeviceTypeRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
// todo generify command handlers
@Component
public class DeviceTypeCommand {

    static final Logger log = LoggerFactory.getLogger(DeviceTypeCommand.class);

    @Autowired
    DeviceTypeRepository repository;

    public DeviceType create(DeviceType deviceType) {
        log.debug(Markers.COMMAND, "Persisting DeviceType {}", deviceType);
        return repository.save(deviceType);
    }

    public DeviceType update(DeviceType deviceType) {
        log.debug(Markers.COMMAND, "Updating DeviceType {}", deviceType);
        return repository.save(deviceType);
    }

    public void delete(String deviceTypeId) {
        repository.delete(deviceTypeId);
    }
}
