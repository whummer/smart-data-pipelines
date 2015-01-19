package io.riots.core.repositories;

import io.riots.api.services.catalog.ThingType;
import io.riots.api.services.catalog.model.ThingTypeElastic;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Component;

/**
 * Repository for persisting {@link ThingType} to ElasticSearch.
 * @author riox
 * @author whummer
 */
@Component
public interface ThingTypeRepository extends ElasticsearchRepository<ThingTypeElastic, String> {

	long countByCreatorId(String userId);

}