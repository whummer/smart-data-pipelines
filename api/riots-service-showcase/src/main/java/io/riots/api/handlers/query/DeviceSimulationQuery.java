package io.riots.api.handlers.query;

import io.riots.core.model.sim.DeviceSimulation;
import io.riots.core.repositories.DeviceSimulationRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class DeviceSimulationQuery {

    @Autowired
    DeviceSimulationRepository repository;

    public DeviceSimulation single(String id) {
        return repository.findOne(id);
    }

    public List<DeviceSimulation> query(Paged paged) {
        return repository.findAll(new PageRequest(
        		paged.getPage(), paged.getSize())).getContent();
    }
}
