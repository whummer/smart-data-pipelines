package io.riots.api.handlers.query;

import io.riots.core.model.Device;
import io.riots.core.repositories.DeviceRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
@Component
public class DeviceQuery {

    @Autowired
    DeviceRepository deviceRepository;

    public Device single(String deviceId) {
        return deviceRepository.findOne(deviceId);
    }

    // todo implement query handling
    public List<Device> query(String query, Paged paged) {
        return deviceRepository.findAll(new PageRequest(paged.getPage(), paged.getSize())).getContent();
    }
}
