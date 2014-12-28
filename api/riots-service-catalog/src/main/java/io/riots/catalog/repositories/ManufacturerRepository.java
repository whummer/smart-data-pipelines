package io.riots.catalog.repositories;

import io.riots.services.catalog.Manufacturer;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Component;

/**
 * Created by omoser on 21/12/14.
 */
@Component
public interface ManufacturerRepository extends ElasticsearchRepository<Manufacturer, String> {
}
