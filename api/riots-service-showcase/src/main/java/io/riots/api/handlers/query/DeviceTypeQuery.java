package io.riots.api.handlers.query;

import io.riots.core.logging.Markers;
import io.riots.core.model.DeviceType;
import io.riots.core.repositories.DeviceTypeRepository;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
@Component
public class DeviceTypeQuery {

    static final Logger log = LoggerFactory.getLogger(DeviceTypeQuery.class);

    @Autowired
    DeviceTypeRepository repository;

    public List<DeviceType> query(String query, Paged paged) {
        if (query == null || query.trim().isEmpty()) {
            return all(paged);
        }

        log.debug(Markers.QUERY, "Handling query '{}' ({})", query, paged);
        List<DeviceType> devices;
        if (!query.matches("\\w+:\\w+")) {
            throw new BadRequestException("Malformed query parameter");
        }

        // todo could also use backrefs from regex above
        String[] filter = query.split(":");
        String field = filter[0];
        String value = filter[1];
        switch (field) {
            case "name":
                devices = findByName(value, paged);
                break;

            // todo implement other query types

            default:
                throw new BadRequestException("Unknown query type '" + field + "'");
        }

        return devices;
    }

    List<DeviceType> findByName(String name, Paged paged) {
        if (paged.isValid()) {
            return repository.findByNameLike(name, new PageRequest(paged.getPage(), paged.getSize())).getContent();
        } else {
            return repository.findByNameLike(name);
        }
    }

    public List<DeviceType> all(Paged paged) {
        log.debug(Markers.QUERY, "Listing all devices");
        List<DeviceType> deviceTypes = new ArrayList<>();
        if (paged.isValid()) {
            Page<DeviceType> page = repository.findAll(new PageRequest(paged.getPage(), paged.getSize()));
            log.debug(Markers.QUERY, "Total DeviceTypes: {}", page.getTotalElements());
            deviceTypes = page.getContent();
        } else {
            for (DeviceType deviceType : repository.findAll()) {
                deviceTypes.add(deviceType);
            }
            // throw new BadRequestException("Please use paging for DeviceType listing"); // todo think about this
        }

        return deviceTypes;
    }

    public DeviceType single(String deviceTypeId) {
        log.debug(Markers.QUERY, "Handling single DeviceType lookup for deviceTypeId '{}'", deviceTypeId);
        DeviceType deviceType = repository.findOne(deviceTypeId);
        if (deviceType == null) {
            log.debug(Markers.QUERY, "No DeviceType for deviceID {}", deviceTypeId);
            throw new NotFoundException("No DeviceType with ID '" + deviceTypeId + "' found");
        } else {
            return deviceType;
        }
    }
}
