package io.riots.core.repositories;

import io.riots.api.services.drivers.DataDriver;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface DeviceDriverRepository extends PagingAndSortingRepository<DataDriver,String> {

    List<DataDriver> findByThingTypeId(String thingTypeId);

    List<DataDriver> findByThingIdAndPropertyName(String thingId, String propertyName);

}
