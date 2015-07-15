package io.riots.core.repositories;

import io.riots.api.services.streams.StreamSink;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by omoser on 09/03/15.
 *
 * @author omoser
 */

public interface StreamSinkRepository extends PagingAndSortingRepository<StreamSink, String> {

	List<StreamSink> findByCreatorId(String creatorId);

	List<StreamSink> findByCreatorIdAndType(String creatorId, StreamSink.StreamSinkType streamSinkType);

}
