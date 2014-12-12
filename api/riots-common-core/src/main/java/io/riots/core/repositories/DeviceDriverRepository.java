package io.riots.core.repositories;

import io.riots.core.model.User;
import io.riots.core.model.driver.DeviceDriver;

import java.util.List;

import org.springframework.stereotype.Repository;

/**
 * @author whummer
 */
@Repository
public interface DeviceDriverRepository extends BaseObjectRepository<DeviceDriver> {

    List<DeviceDriver> findByDeviceType(String devTypeId);

    List<DeviceDriver> findByDeviceTypeAndCreatorOrDeviceTypeAndCreatorIsNull(String itemId, User user, String itemId2);

}
