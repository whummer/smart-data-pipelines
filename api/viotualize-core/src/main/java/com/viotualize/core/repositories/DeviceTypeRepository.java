package com.viotualize.core.repositories;

import com.viotualize.core.domain.DeviceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author omoser
 */

@Repository
public interface DeviceTypeRepository extends BaseObjectRepository<DeviceType> {

    List<DeviceType> findByType(DeviceType.Type deviceType);

    Page<DeviceType> findByType(DeviceType.Type deviceType, Pageable pageable);

    List<DeviceType> findByManufacturerName(String name);

    Page<DeviceType> findByManufacturerName(String name, Pageable pageable);

}
