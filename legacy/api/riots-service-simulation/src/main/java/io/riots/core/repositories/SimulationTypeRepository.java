package io.riots.core.repositories;

import io.riots.api.services.sim.SimulationType;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface SimulationTypeRepository extends PagingAndSortingRepository<SimulationType,String> {
}
