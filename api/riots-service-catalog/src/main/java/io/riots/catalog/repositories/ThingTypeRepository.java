package io.riots.catalog.repositories;

import io.riots.services.catalog.ThingType;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Component;

/**
 * Repository for persisting {@link ThingType} to ElasticSearch.
 * @author riox
 *
 */
@Component
public interface ThingTypeRepository extends
		ElasticsearchRepository<ThingType, String> {
}