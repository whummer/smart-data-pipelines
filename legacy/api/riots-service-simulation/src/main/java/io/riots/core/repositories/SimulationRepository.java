package io.riots.core.repositories;

import io.riots.api.services.sim.Simulation;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface SimulationRepository extends PagingAndSortingRepository<Simulation,String> {

	Simulation findBySimulationPropertiesPropertyNameAndSimulationPropertiesThingId(String propertyName, String
			thingId);
}
