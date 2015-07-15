package io.riots.core.repositories;

import io.riots.api.services.streams.Stream;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface StreamRepository extends PagingAndSortingRepository<Stream,String> {

	List<Stream> findByCreatorId(String userId);

	List<Stream> findByVisibleAndNameLike(boolean visible, String name);

	List<Stream> findBySinkId(String sinkId);
}
