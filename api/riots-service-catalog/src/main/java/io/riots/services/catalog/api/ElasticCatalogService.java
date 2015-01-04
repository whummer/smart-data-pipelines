package io.riots.services.catalog.api;

import io.riots.catalog.repositories.ManufacturerRepository;
import io.riots.catalog.repositories.ThingTypeRepository;
import io.riots.services.CatalogService;
import io.riots.services.catalog.Manufacturer;
import io.riots.services.catalog.ThingType;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import javax.annotation.PostConstruct;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriBuilder;

import org.apache.commons.lang.StringUtils;
import org.apache.cxf.jaxrs.ext.MessageContext;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.QueryStringQueryBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;

/**
 * Implements the Catalog REST API edge service.
 *
 * @author riox
 * @author whummer
 */
@Service
public class ElasticCatalogService implements CatalogService {

	static final Logger log = LoggerFactory.getLogger(ElasticCatalogService.class);

    @Autowired
    ThingTypeRepository thingTypeRepository;

    @Autowired
    ManufacturerRepository manufacturerRepository;

    @Autowired
    ElasticsearchTemplate searchTemplate;

    @Context
    MessageContext context;    
    
    @PostConstruct
    private void init() {    	
    	// creating initial index and mapping
    	if (!searchTemplate.indexExists(ThingType.class)) {
    		searchTemplate.createIndex(ThingType.class);
    	}
    	// I believe putMapping can be done every time
    	searchTemplate.putMapping(ThingType.class);
    	searchTemplate.refresh(ThingType.class, true); 
    	
    	if (!searchTemplate.indexExists(Manufacturer.class)) {
    		searchTemplate.createIndex(Manufacturer.class);
    	}
    	// I believe putMapping can be done every time
    	searchTemplate.putMapping(Manufacturer.class);
    	searchTemplate.refresh(Manufacturer.class, true);
    }
    

    @Override
    @Timed @ExceptionMetered
    public ThingType retrieveThingType(String thingTypeId) {
        if (thingTypeRepository.exists(thingTypeId)) {
            return thingTypeRepository.findOne(thingTypeId);
        } else {
            throw new NotFoundException("No such thing type: " + thingTypeId);
        }
    }


    @Override
    @Timed @ExceptionMetered
    public List<ThingType> listThingTypes(String query, int page, int size) {

        // set reasonable defaults
        if (StringUtils.isEmpty(query))
            query = "*:*";
        if (page <= 0)
            page = 0;
        if (size <= 0)
            size = 100;

        QueryStringQueryBuilder
        qBuilder = QueryBuilders.queryString(query).analyzeWildcard(true);
        qBuilder.lenient(true);
        try {
	        Page<ThingType> result = thingTypeRepository.search(
	                qBuilder, new PageRequest(page, size));
	        return result.getContent();
        } catch (Throwable t) {
        	log.info("ElasticSearch query parsing failed: {}", t.getMessage());
        	
        	// we return all results if the query fails`
            qBuilder = QueryBuilders.queryString("*:*");
 	        Page<ThingType> result = thingTypeRepository.search(
 	                qBuilder, new PageRequest(page, size));
 	        return result.getContent();
        }
        
    }

    @Override
    @Timed @ExceptionMetered
    public ThingType createThingType(ThingType thingType) {
        try {
            Long id = Math.abs(UUID.randomUUID().getMostSignificantBits());
            log.debug("Created ID for document: {}", id);
            thingType.setId(id.toString());
            ThingType result = thingTypeRepository.index(thingType);
            URI location = UriBuilder.fromPath("/catalog/thing-types/{id}").build(result.getId());
            context.getHttpServletResponse().addHeader("Location", location.toString());
            return result;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new WebApplicationException(e);
        }
    }

    @Override
    @Timed @ExceptionMetered
    public ThingType updateThingType(ThingType thingType) {
        try {
            if (StringUtils.isEmpty(thingType.getId())) {
                throw new IllegalArgumentException("id not present");
            }
            thingType = thingTypeRepository.index(thingType);
            return thingType;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new WebApplicationException(e);
        }
    }

    @Override
    @Timed @ExceptionMetered
    public void deleteThingType(String thingTypeId) {
        if (thingTypeRepository.exists(thingTypeId)) {
            thingTypeRepository.delete(thingTypeId);
        } else {
            throw new NotFoundException("No such thing: " + thingTypeId);
        }
    }

    @Override
    @Timed @ExceptionMetered
    public long countThingTypes() {
    	return thingTypeRepository.count();
    }

    /* MANUFACTURERS */

    @Override
    @Timed @ExceptionMetered
    public Manufacturer retrieveManufacturer(String manufacturerId) {
        if (manufacturerRepository.exists(manufacturerId)) {
            return manufacturerRepository.findOne(manufacturerId);
        } else {
            throw new NotFoundException("No such manufacturer: " + manufacturerId);
        }
    }

    @Override
    @Timed @ExceptionMetered
    public List<Manufacturer> listManufacturers(String query, int page, int size) {

        // todo remove duplication and handle the param validation in an aspect
        if (StringUtils.isEmpty(query))
            query = "*:*";
        if (page <= 0)
            page = 0;
        if (size <= 0)
            size = 100;

        Page<Manufacturer> result = manufacturerRepository.search(QueryBuilders.queryString(query), new PageRequest(page, size));
        return result.getContent();
    }

    @Override
    @Timed @ExceptionMetered
    public Manufacturer createManufacturer(Manufacturer manufacturer) {
        log.trace("Invoking create()");
        try {
            Long id = Math.abs(UUID.randomUUID().getMostSignificantBits());
            log.debug("Created ID for document: {}", id);
            manufacturer.setId(id.toString());
            Manufacturer result = manufacturerRepository.index(manufacturer);
            URI location = UriBuilder.fromPath("/catalog/manufacturers/{id}").build(result.getId());
            context.getHttpServletResponse().addHeader("Location", location.toString());
            return result;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new WebApplicationException(e);
        }
    }

    @Override
    @Timed @ExceptionMetered
    public Manufacturer updateManufacturer(Manufacturer manufacturer) {
        try {
            if (StringUtils.isEmpty(manufacturer.getId())) {
                throw new IllegalArgumentException("id not present");
            }

            manufacturer = manufacturerRepository.index(manufacturer);
            return manufacturer;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new WebApplicationException(e);
        }
    }

    @Override
    @Timed @ExceptionMetered
    public void deleteManufacturer(String manufacturerId) {
        manufacturerRepository.delete(manufacturerId);
    }
}
