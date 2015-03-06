package io.riots.core.repositories;

import io.riots.api.services.streams.StreamPermission;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface StreamPermissionRepository extends PagingAndSortingRepository<StreamPermission,String> {

}
