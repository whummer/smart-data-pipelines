package io.riots.core.repositories;

import io.riots.core.model.BaseObjectCreated;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * @author Waldemar Hummer
 */
public interface BaseObjectCreatedRepository<T extends BaseObjectCreated<T>> extends BaseObjectRepository<T> {

    List<T> findByCreatedBetween(Date from, Date to);

    Page<T> findByCreatedBetween(Date from, Date to, Pageable pageable);

}
