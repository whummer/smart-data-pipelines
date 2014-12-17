package io.riots.api.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.model.AssetCategory;
import io.riots.core.repositories.AssetCategoryRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author Waldemar Hummer
 */
@Component
public class AssetCategoryCommand {

    static final Logger log = LoggerFactory.getLogger(AssetCategoryCommand.class);

    @Autowired
    AssetCategoryRepository repository;

    public AssetCategory create(AssetCategory deviceType) {
        log.debug(Markers.COMMAND, "Persisting DeviceType {}", deviceType);
        return repository.save(deviceType);
    }

    public AssetCategory update(AssetCategory deviceType) {
        log.debug(Markers.COMMAND, "Updating DeviceType {}", deviceType);
        return repository.save(deviceType);
    }

    public void delete(String deviceTypeId) {
        repository.delete(deviceTypeId);
    }
}
