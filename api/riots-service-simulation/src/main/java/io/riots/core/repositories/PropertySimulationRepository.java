package io.riots.core.repositories;

import org.springframework.data.repository.PagingAndSortingRepository;

import io.riots.services.sim.PropertySimulation;

/**
 * @author whummer
 */
public interface PropertySimulationRepository extends PagingAndSortingRepository<PropertySimulation<?>,String> {

}
