package com.viotualize.smo.core;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.viotualize.smo.rest.domain.SmartObject;

public interface SmartObjectRepository extends PagingAndSortingRepository<SmartObject, String> {

	 List<SmartObject> findByCreator(String userId);
   Page<SmartObject> findByName(String name, Pageable pageable);
   Page<SmartObject> findByManufacturer(String manufacturer, Pageable pageable);
}