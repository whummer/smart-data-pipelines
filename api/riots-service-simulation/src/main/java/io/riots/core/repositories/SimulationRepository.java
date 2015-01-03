package io.riots.core.repositories;

import io.riots.services.sim.Simulation;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface SimulationRepository extends PagingAndSortingRepository<Simulation,String> {
}