package io.riots.core.repositories;

import io.riots.api.services.catalog.model.ManufacturerElastic;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Component;

/**
 * Created by omoser on 21/12/14.
 */
@Component
public interface ManufacturerRepository extends ElasticsearchRepository<ManufacturerElastic, String> {
}
