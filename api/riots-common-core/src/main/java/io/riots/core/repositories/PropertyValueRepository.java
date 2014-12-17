package io.riots.core.repositories;

import io.riots.core.model.Property;
import io.riots.core.model.PropertyValue;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface PropertyValueRepository extends PagingAndSortingRepository<PropertyValue<?>, String> {

	Page<PropertyValue<?>> findByProperty(Property<?> prop, Pageable pageable);

}
