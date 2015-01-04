package io.riots.core.repositories;

import java.util.List;

import io.riots.services.scenario.PropertyValue;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface PropertyValueRepository extends PagingAndSortingRepository<PropertyValue, String> {

	Page<PropertyValue> findByThingIdAndPropertyName(String thingId, String propName, Pageable pageable);

	long countByThingIdIn(List<String> thingIds);

}
