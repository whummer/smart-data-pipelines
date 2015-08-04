package io.riots.core.handlers.query;

import io.riots.core.repositories.SimulationTypeRepository;
import io.riots.api.services.sim.SimulationType;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class SimulationTypeQuery {

    @Autowired
    SimulationTypeRepository repository;

    public SimulationType single(String deviceId) {
        return repository.findOne(deviceId);
    }

    public List<SimulationType> query(Paged paged) {
        return repository.findAll(new PageRequest(paged.getPage(), paged.getSize())).getContent();
    }
}
