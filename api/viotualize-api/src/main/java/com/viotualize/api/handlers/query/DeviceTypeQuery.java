package com.viotualize.api.handlers.query;

import com.viotualize.core.logging.Markers;
import com.viotualize.core.domain.DeviceType;
import com.viotualize.core.repositories.DeviceTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * @author omoser
 */
// TODO FR: shall these be hystrix command
@Component
public class DeviceTypeQuery {

    static final Logger log = LoggerFactory.getLogger(DeviceTypeQuery.class);

    @Autowired
    DeviceTypeRepository repository;

    public List<DeviceType> query(String query, Paged paged) {
        if (query == null) {
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
            case "type":
                devices = findByType(value, paged);
                break;

            case "name":
                devices = findByName(value, paged);
                break;

            // todo implement other query types

            default:
                throw new BadRequestException("Unknown query type '" + field + "'");
        }

        return devices;
    }

    List<DeviceType> findByType(String value, Paged paged) {
        String normalizedDeviceType = normalizeDeviceType(value);
        DeviceType.Type type = DeviceType.Type.valueOf(normalizedDeviceType);
        if (paged.isValid()) {
            return repository.findByType(type, new PageRequest(paged.getPage(), paged.getSize())).getContent();
        } else {
            return repository.findByType(DeviceType.Type.valueOf(normalizedDeviceType));
        }
    }

    List<DeviceType> findByName(String name, Paged paged) {
        if (paged.isValid()) {
            return repository.findByNameLike(name, new PageRequest(paged.getPage(), paged.getSize())).getContent();
        } else {
            return repository.findByNameLike(name);
        }
    }

    private String normalizeDeviceType(String value) {
        if (!Arrays.asList(DeviceType.Type.values()).stream().anyMatch(d -> d.toString().equals(value))) {
            throw new BadRequestException("Unsupported device type: " + value);
        }

        return value.toUpperCase();
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


        if (deviceTypes.isEmpty()) {
            throw new NotFoundException("No DeviceTypes found");
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
