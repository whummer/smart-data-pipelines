package io.riots.core.repositories;

import io.riots.core.model.driver.DeviceDriver;
import io.riots.services.users.User;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface DeviceDriverRepository extends PagingAndSortingRepository<DeviceDriver,String> {

    List<DeviceDriver> findByThingType(String devTypeId);

    List<DeviceDriver> findByThingTypeAndCreatorOrThingTypeAndCreatorIsNull(String itemId, User user, String itemId2);

}
