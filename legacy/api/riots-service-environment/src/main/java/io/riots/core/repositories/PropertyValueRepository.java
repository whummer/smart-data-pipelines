package io.riots.core.repositories;

import io.riots.api.services.scenarios.PropertyValue;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface PropertyValueRepository extends PagingAndSortingRepository<PropertyValue, String> {

	Page<PropertyValue> findByThingIdAndPropertyName(String thingId, String propName, Pageable pageable);

	long countByThingIdIn(List<String> thingIds);

	long countByThingIdInAndTimestampBetween(List<String> thingIds, double timeFrom, double timeTo);

}
