package io.riots.core.repositories;

import io.riots.services.scenario.Scenario;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface ScenarioRepository extends PagingAndSortingRepository<Scenario,String> {
}
