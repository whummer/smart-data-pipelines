package com.viotualize.api.handlers.command;

import com.viotualize.core.domain.Manufacturer;
import com.viotualize.core.logging.Markers;
import com.viotualize.core.repositories.ManufacturerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
// todo generify command handlers
@Component
public class ManufacturerCommand {

    static final Logger log = LoggerFactory.getLogger(ManufacturerCommand.class);

    @Autowired
    ManufacturerRepository manufacturerRepository;

    public Manufacturer create(Manufacturer manufacturer) {
        log.debug(Markers.COMMAND, "Persisting Manufacturer {}", manufacturer);
        return manufacturerRepository.save(manufacturer);
    }

    public Manufacturer update(Manufacturer manufacturer) {
        log.debug(Markers.COMMAND, "Updating Manufacturer {}", manufacturer);
        return manufacturerRepository.save(manufacturer);
    }

    public void delete(String manufacturerId) {
        manufacturerRepository.delete(manufacturerId);
    }
}
