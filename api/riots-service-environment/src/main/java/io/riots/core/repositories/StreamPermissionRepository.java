package io.riots.core.repositories;

import io.riots.api.services.streams.StreamPermission;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface StreamPermissionRepository extends PagingAndSortingRepository<StreamPermission,String> {

	List<StreamPermission> findByStreamId(String streamID);

}
