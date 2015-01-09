package io.riots.core.repositories;

import io.riots.services.triggers.Trigger;
import io.riots.services.triggers.Trigger.TriggerType;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface TriggerRepository extends PagingAndSortingRepository<Trigger,String> {

	long countByCreatorId(String userId);

	List<Trigger> findByCreatorId(String userId);

	List<Trigger> findByTypeAndCreatorId(TriggerType type, String userId);

}
