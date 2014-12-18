package io.riots.catalog.repositories;

import io.riots.services.catalog.ThingType;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Repository for persisting {@link ThingType} to ElasticSearch.
 * @author riox
 *
 */
public interface ThingTypeRepository extends
		ElasticsearchRepository<ThingType, String> {
}