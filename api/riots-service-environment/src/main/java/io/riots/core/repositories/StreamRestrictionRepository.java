package io.riots.core.repositories;

import io.riots.api.services.streams.StreamRestriction;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface StreamRestrictionRepository extends PagingAndSortingRepository<StreamRestriction,String> {

	List<StreamRestriction> findByStreamId(String streamID);

	List<StreamRestriction> deleteByStreamIdAndThingIdAndPropertyName(String streamID, String thingID, String propertyName);

}
