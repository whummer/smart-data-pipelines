package com.viotualize.core.repositories;

import com.viotualize.services.model.CatalogEntry;
import org.springframework.stereotype.Repository;

@Repository
public interface CatalogRepository extends BaseObjectRepository<CatalogEntry> {
}