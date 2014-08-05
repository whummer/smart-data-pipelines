package com.viotualize.core.repositories;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.viotualize.core.domain.BaseObjectCreated;

/**
 * @author Waldemar Hummer
 */
// todo check how we can exclude this base interface from being picked up by the repository scanner
public interface BaseObjectCreatedRepository<T extends BaseObjectCreated<T>> extends BaseObjectRepository<T> {

    List<T> findByCreatedBetween(Date from, Date to);

    Page<T> findByCreatedBetween(Date from, Date to, Pageable pageable);

}
