package io.riots.core.repositories;

import java.util.List;

import io.riots.api.services.scenarios.PropertyValue;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

/**
 * @author whummer
 */
public interface PropertyValueRepository extends PagingAndSortingRepository<PropertyValue, String> {

	Page<PropertyValue> findByThingIdAndPropertyName(String thingId, String propName, Pageable pageable);

	long countByThingIdIn(List<String> thingIds);

	long countByThingIdInAndTimestampBetween(List<String> thingIds, double timeFrom, double timeTo);

}
