package io.riots.core.repositories;

import io.riots.api.model.BaseObjectCategorized;

import java.util.List;

/**
 * @author Waldemar Hummer
 */
public interface BaseObjectCategorizedRepository<T extends BaseObjectCategorized<T>> extends BaseObjectRepository<T> {

    List<T> findByCategoryAndName(String cat, String name);

    List<T> findByCategory(String cat);

}
