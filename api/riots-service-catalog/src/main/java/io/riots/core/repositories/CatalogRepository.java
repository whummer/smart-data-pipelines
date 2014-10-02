package io.riots.core.repositories;

import io.riots.services.model.CatalogEntry;
import org.springframework.stereotype.Repository;

@Repository
public interface CatalogRepository extends BaseObjectRepository<CatalogEntry> {
}