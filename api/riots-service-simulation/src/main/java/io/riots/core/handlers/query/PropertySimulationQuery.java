package io.riots.core.handlers.query;

import io.riots.core.repositories.PropertySimulationRepository;
import io.riots.api.services.sim.PropertySimulation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class PropertySimulationQuery {

    @Autowired
    PropertySimulationRepository propSimRepo;

    public PropertySimulation<?> single(String id) {
        return propSimRepo.findOne(id);
    }

    // TODO remove
//    public List<PropertySimulation<?>> query(Simulation sim) {
//    	List<PropertySimulation<?>> result = new LinkedList<PropertySimulation<?>>();
//    	for(String propSimId : sim.getSimulationProperties()) {
//    		result.add(single(propSimId));
//    	}
//    	return result;
//    }
}
