package io.riots.core.repositories;

import io.riots.model.ThingMongo;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface ThingRepository extends PagingAndSortingRepository<ThingMongo,String> {
}
