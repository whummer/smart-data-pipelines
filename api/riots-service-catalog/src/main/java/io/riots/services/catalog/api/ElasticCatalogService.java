package io.riots.services.catalog.api;

import io.riots.catalog.repositories.ManufacturerRepository;
import io.riots.catalog.repositories.ThingTypeRepository;
import io.riots.core.service.CatalogService;
import io.riots.services.catalog.Manufacturer;
import io.riots.services.catalog.ThingType;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import javax.annotation.PostConstruct;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriBuilder;

import org.apache.commons.lang.StringUtils;
import org.apache.cxf.jaxrs.ext.MessageContext;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.QueryStringQueryBuilder;
import org.elasticsearch.search.SearchParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.stereotype.Service;

/**
 * Implements the Catalog REST API edge service.
 *
 * @author riox
 * @author whummer
 */
@Service
@Path("/catalog")
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
    }
    

    @Override
    public ThingType retrieveThingType(String thingTypeId) {
        if (thingTypeRepository.exists(thingTypeId)) {
            return thingTypeRepository.findOne(thingTypeId);
        } else {
            throw new NotFoundException("No such thing: " + thingTypeId);
        }
    }


    @Override
    public List<ThingType> listThingTypes(String query, int page, int size) {

        // set reasonable defaults
        if (StringUtils.isEmpty(query))
            query = "*:*";
        if (page <= 0)
            page = 0;
        if (size <= 0)
            size = 100;

        
        try {
	        QueryStringQueryBuilder qBuilder = QueryBuilders.queryString(query).analyzeWildcard(true);
	        qBuilder.lenient(true);
	        
	        Page<ThingType> result = thingTypeRepository.search(
	                qBuilder, new PageRequest(page, size));
	
	        return result.getContent();
        } catch (Throwable t) {
        	log.info("ElasticSearch query parsing failed: {}", t.getMessage());
        	return new ArrayList<ThingType>();
        }
        
    }


    @Override
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
    public void deleteThingType(String thingTypeId) {
        if (thingTypeRepository.exists(thingTypeId)) {
            thingTypeRepository.delete(thingTypeId);
        } else {
            throw new NotFoundException("No such thing: " + thingTypeId);
        }
    }

    @Override
    @GET
    @Path("/manufacturers/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Manufacturer retrieveManufacturer(@PathParam("id") String manufacturerId) {
        if (manufacturerRepository.exists(manufacturerId)) {
            return manufacturerRepository.findOne(manufacturerId);
        } else {
            throw new NotFoundException("No such manufacturer: " + manufacturerId);
        }
    }

    @Override
    @GET
    @Path("/manufacturers")
    @Produces(MediaType.APPLICATION_JSON)
    public List<Manufacturer> listManufacturers(@QueryParam("q") String query, @QueryParam("page") int page, @QueryParam("size") int size) {

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
    @POST
    @Path("/manufacturers")
    @Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
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
    @PUT
    @Path("/manufacturers")
    @Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
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
    @DELETE
    @Path("/manufacturers/{id}")
    @Produces({ MediaType.APPLICATION_JSON })
    public void deleteManufacturer(@PathParam("id") String manufacturerId) {
        manufacturerRepository.delete(manufacturerId);
    }
}
