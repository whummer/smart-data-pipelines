package io.riots.core.repositories;

import io.riots.core.model.DeviceType;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

/**
 * @author omoser
 */

@Repository
public interface DeviceTypeRepository extends BaseObjectRepository<DeviceType> {

    List<DeviceType> findByManufacturerName(String name);

    Page<DeviceType> findByManufacturerName(String name, Pageable pageable);

}
