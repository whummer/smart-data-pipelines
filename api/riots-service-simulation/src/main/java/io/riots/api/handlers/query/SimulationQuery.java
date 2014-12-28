package io.riots.api.handlers.query;

import io.riots.core.repositories.SimulationRepository;
import io.riots.core.services.sim.Simulation;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class SimulationQuery {

    @Autowired
    SimulationRepository repository;

    public Simulation single(String deviceId) {
        return repository.findOne(deviceId);
    }

    public List<Simulation> query(Paged paged) {
        return repository.findAll(new PageRequest(paged.getPage(), paged.getSize())).getContent();
    }
}
