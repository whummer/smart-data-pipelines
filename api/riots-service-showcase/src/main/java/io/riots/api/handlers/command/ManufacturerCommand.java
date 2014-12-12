package io.riots.api.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.model.Manufacturer;
import io.riots.core.repositories.ManufacturerRepository;

import java.util.List;

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

	public Manufacturer getOrCreate(Manufacturer item) {
		List<Manufacturer> list = manufacturerRepository.findByCategoryAndName(item.getCategory(), item.getName());
    	if(!list.isEmpty()) {
    		return list.get(0);
    	}
        log.debug(Markers.COMMAND, "Persisting Manufacturer {}", item);
        return manufacturerRepository.save(item);
    }

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
