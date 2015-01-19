package io.riots.core.repositories;

import java.util.Collection;
import java.util.List;

import io.riots.api.services.model.ThingMongo;
import io.riots.api.services.scenarios.Thing;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface ThingRepository extends PagingAndSortingRepository<ThingMongo,String> {

	long countByCreatorId(String userId);

	List<Thing> findByCreatorId(String userId);

	List<Thing> findByIdIn(Collection<String> ids);

}
