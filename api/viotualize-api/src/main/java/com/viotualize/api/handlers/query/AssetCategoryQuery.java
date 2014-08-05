package com.viotualize.api.handlers.query;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import com.viotualize.core.domain.AssetCategory;
import com.viotualize.core.logging.Markers;
import com.viotualize.core.repositories.AssetCategoryRepository;

/**
 * @author Waldemar Hummer
 */
@Component
public class AssetCategoryQuery {

    static final Logger log = LoggerFactory.getLogger(AssetCategoryQuery.class);

    @Autowired
    AssetCategoryRepository repository;

    public List<AssetCategory> query(String query, Paged paged) {
        if (query == null) {
            return all(paged);
        }

        log.debug(Markers.QUERY, "Handling query '{}' ({})", query, paged);
        List<AssetCategory> list;
        if (!query.matches("\\w+:\\w+")) {
            throw new BadRequestException("Malformed query parameter");
        }

        // todo could also use backrefs from regex above
        String[] filter = query.split(":");
        String field = filter[0];
        String value = filter[1];
        switch (field) {
            case "name":
                list = findByName(value, paged);
                break;
            // todo implement other query types

            default:
                throw new BadRequestException("Unknown query type '" + field + "'");
        }

        return list;
    }

    List<AssetCategory> findByName(String name, Paged paged) {
        if (paged.isValid()) {
            return repository.findByNameLike(name, 
            		new PageRequest(paged.getPage(), paged.getSize())).getContent();
        } else {
            return repository.findByNameLike(name);
        }
    }

    public List<AssetCategory> all(Paged paged) {
        log.debug(Markers.QUERY, "Listing all categories");
        List<AssetCategory> list = new ArrayList<>();
        if (paged.isValid()) {
            Page<AssetCategory> page = repository.findAll(new PageRequest(paged.getPage(), paged.getSize()));
            log.debug(Markers.QUERY, "Total DeviceTypes: {}", page.getTotalElements());
            list = page.getContent();
        } else {
            for (AssetCategory deviceType : repository.findAll()) {
                list.add(deviceType);
            }
        }

        if (list.isEmpty()) {
            throw new NotFoundException("No DeviceTypes found");
        }

        return list;
    }

    public AssetCategory single(String deviceTypeId) {
        log.debug(Markers.QUERY, "Handling single DeviceType lookup for deviceTypeId '{}'", deviceTypeId);
        AssetCategory entity = repository.findOne(deviceTypeId);
        if (entity == null) {
            log.debug(Markers.QUERY, "No DeviceType for deviceID {}", deviceTypeId);
            throw new NotFoundException("No DeviceType with ID '" + deviceTypeId + "' found");
        } else {
            return entity;
        }
    }
}
