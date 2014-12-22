package io.riots.core.repositories;

import org.springframework.data.repository.PagingAndSortingRepository;

import io.riots.core.model.sim.PropertySimulation;

/**
 * @author whummer
 */
public interface PropertySimulationRepository extends PagingAndSortingRepository<PropertySimulation<?>,String> {
}
