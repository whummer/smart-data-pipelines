package io.riots.catalog.repositories;

import io.riots.catalog.model.DeviceType;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

public interface CatalogRepository extends ElasticsearchRepository<DeviceType,String> {
}