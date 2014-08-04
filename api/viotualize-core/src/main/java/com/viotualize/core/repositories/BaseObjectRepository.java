package com.viotualize.core.repositories;

import com.viotualize.core.domain.BaseObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

/**
 * @author omoser
 */
// todo check how we can exclude this base interface from being picked up by the repository scanner
public interface BaseObjectRepository<T> extends PagingAndSortingRepository<T, String> {

    List<T> findByNameLike(String name);

    Page<T> findByNameLike(String name, Pageable pageable);

    List<T> findByCreatedBetween(Date from, Date to);

    Page<T> findByCreatedBetween(Date from, Date to, Pageable pageable);

}
