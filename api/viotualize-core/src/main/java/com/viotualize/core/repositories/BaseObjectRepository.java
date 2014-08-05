package com.viotualize.core.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author omoser
 */
// todo check how we can exclude this base interface from being picked up by the repository scanner
public interface BaseObjectRepository<T> extends PagingAndSortingRepository<T, String> {

    List<T> findByNameLike(String name);

    Page<T> findByNameLike(String name, Pageable pageable);

}
