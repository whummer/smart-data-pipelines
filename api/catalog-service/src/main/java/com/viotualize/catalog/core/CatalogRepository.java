package com.viotualize.catalog.core;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.viotualize.catalog.rest.domain.CatalogEntry;

public interface CatalogRepository extends PagingAndSortingRepository<CatalogEntry, String> {

	 List<CatalogEntry> findByCreator(String userId);
   Page<CatalogEntry> findByName(String name, Pageable pageable);
   Page<CatalogEntry> findByManufacturer(String manufacturer, Pageable pageable);
}