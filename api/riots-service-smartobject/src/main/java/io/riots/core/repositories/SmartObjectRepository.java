package io.riots.core.repositories;

import io.riots.core.repositories.domain.SmartObject;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SmartObjectRepository extends PagingAndSortingRepository<SmartObject,String> {
}