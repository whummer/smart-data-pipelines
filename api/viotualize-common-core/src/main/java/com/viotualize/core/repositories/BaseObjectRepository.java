package com.viotualize.core.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

/**
 * @author omoser
 */
@Repository
public interface BaseObjectRepository<T> extends PagingAndSortingRepository<T, String> {

    List<T> findByNameLike(String name);

    Page<T> findByNameLike(String name, Pageable pageable);

}
