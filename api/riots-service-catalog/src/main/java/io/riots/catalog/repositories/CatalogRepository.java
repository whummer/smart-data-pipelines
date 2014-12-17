package io.riots.catalog.repositories;

import io.riots.catalog.model.ThingType;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface CatalogRepository extends
		ElasticsearchRepository<ThingType, String> {
}