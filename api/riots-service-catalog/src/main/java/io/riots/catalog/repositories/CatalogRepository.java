package io.riots.catalog.repositories;

import io.riots.services.catalog.ThingType;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface CatalogRepository extends
		ElasticsearchRepository<ThingType, String> {
}