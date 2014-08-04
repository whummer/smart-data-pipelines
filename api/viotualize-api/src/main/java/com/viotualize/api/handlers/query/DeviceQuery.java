package com.viotualize.api.handlers.query;

import com.viotualize.core.domain.Device;
import com.viotualize.core.repositories.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;

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
