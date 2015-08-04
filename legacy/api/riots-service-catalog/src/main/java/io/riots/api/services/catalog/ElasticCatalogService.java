package io.riots.api.services.catalog;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand;
import io.riots.api.services.catalog.model.ManufacturerElastic;
import io.riots.api.services.catalog.model.ThingTypeElastic;
import io.riots.api.services.files.FileData;
import io.riots.api.services.files.FilesService;
import io.riots.core.clients.ServiceClientFactory;
import io.riots.core.cxf.MessageContextUtil;
import io.riots.core.repositories.ManufacturerRepository;
import io.riots.core.repositories.ThingTypeRepository;
import io.riots.core.util.ServiceUtil;
import org.apache.commons.lang.StringUtils;
import org.apache.cxf.headers.Header;
import org.apache.cxf.helpers.CastUtils;
import org.apache.cxf.jaxrs.ext.MessageContext;
import org.apache.cxf.jaxrs.ext.MessageContextImpl;
import org.apache.cxf.message.Message;
import org.apache.cxf.phase.PhaseInterceptorChain;
import org.apache.cxf.transport.http.Headers;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.QueryStringQueryBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriBuilder;
import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implements the Catalog REST API edge clients.
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
    ElasticsearchOperations elasticsearchTemplate;
    
    @Autowired
	ServiceClientFactory serviceClientFactory;

    @Autowired
    MessageContextUtil messageContextUtil;

    @PostConstruct
    private void init() {    	
    	// creating initial index and mapping
    	if (!elasticsearchTemplate.indexExists(ThingTypeElastic.class)) {
            elasticsearchTemplate.createIndex(ThingTypeElastic.class);
    	}
    	// I believe putMapping can be done every time
        elasticsearchTemplate.putMapping(ThingTypeElastic.class);
        elasticsearchTemplate.refresh(ThingTypeElastic.class, true);
    	
    	if (!elasticsearchTemplate.indexExists(ManufacturerElastic.class)) {
            elasticsearchTemplate.createIndex(ManufacturerElastic.class);
    	}
    	// I believe putMapping can be done every time
        elasticsearchTemplate.putMapping(ManufacturerElastic.class);
        elasticsearchTemplate.refresh(ManufacturerElastic.class, true);
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

        QueryStringQueryBuilder qBuilder = QueryBuilders.queryString(query).analyzeWildcard(true);
        qBuilder.lenient(true);
        try {
	        Page<ThingTypeElastic> result = thingTypeRepository.search(qBuilder, new PageRequest(page, size));
	        return result.getContent().stream().map(ThingType.class::cast).collect(Collectors.toList());
        } catch (Throwable t) {
        	log.info("ElasticSearch query parsing failed: {}", t.getMessage());
        	
        	// we return all results if the query fails`
            qBuilder = QueryBuilders.queryString("*:*");
 	        Page<ThingTypeElastic> result = thingTypeRepository.search(qBuilder, new PageRequest(page, size));
            return result.getContent().stream().map(ThingType.class::cast).collect(Collectors.toList());
        }
        
    }

    @Override
    @Timed @ExceptionMetered
    public ThingType createThingType(ThingType thingType) {
        try {
            Long id = Math.abs(UUID.randomUUID().getMostSignificantBits());
            log.debug("Created ID for document: {}", id);
            thingType.setId(id.toString());
            
            processBase64Images(thingType);
            
            ThingType result = thingTypeRepository.index(new ThingTypeElastic(thingType));
            URI location = UriBuilder.fromPath("/catalog/thing-types/{id}").build(result.getId());
            messageContextUtil.addLocationHeader(location.toString());
            return result;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new WebApplicationException(e);
        }
    }
    
    
    /**
     * Process {@link ImageData} elements by storing any base64 encoded string in the 
     * file clients and returning an HREF that is stored in ElasticSearch.
     */
    @HystrixCommand(fallbackMethod = "setDefaultImages")
    protected void processBase64Images(ThingType thingType) {
        FilesService fileService = serviceClientFactory.getFilesServiceClient();
    	List<ImageData> images = thingType.getImageData();
    	if (images != null) {
	        for (ImageData imgData : images) {            	
	        	String base64String = imgData.getBase64String();
	        	if (base64String != null) {
	        		String fileId = fileService.create(new FileData(imgData.getContentType(), base64String));
                    imgData.setId(fileId);
	        		imgData.setHref(ServiceUtil.API_PATH + "files/" + fileId );
	        		imgData.setBase64String(null); // remove the base64 string explicitly  
	        	}            	
	        }
    	}
    }
    
    protected void setDefaultImages(FilesService fileService, ThingType thingType) {
    	List<ImageData> images = thingType.getImageData();
    	if (images != null) {
    		for (ImageData imgData : thingType.getImageData()) {
    			imgData.setHref("img/no_image_available.jpg");      	            	
    		}
    	}
    }

    @Override
    @Timed @ExceptionMetered
    public ThingType updateThingType(ThingType thingType) {
        try {
            if (StringUtils.isEmpty(thingType.getId())) {
                throw new IllegalArgumentException("id not present");
            }            
            processBase64Images(thingType);
            thingType = thingTypeRepository.index(new ThingTypeElastic(thingType));
            return thingType;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new WebApplicationException(e);
        }
    }

    @Override
    @Timed @ExceptionMetered
    public void deleteThingType(String thingTypeId) {
    	FilesService fileService = serviceClientFactory.getFilesServiceClient();
        if (thingTypeRepository.exists(thingTypeId)) {        	   

        	// TODO put this in a Hystrix command
        	ThingType tt = thingTypeRepository.findOne(thingTypeId);
        	List<ImageData> imageData = tt.getImageData();
        	if (imageData != null) {
        		for (ImageData data : imageData) {
        			String id = data.getId();
        			// TODO this is for backward compatibility b/c we introduced saving the id explicitly at a later point
        			if (id == null) {
        				String href = data.getHref();
        				id = href.substring(href.lastIndexOf('/') + 1);
        			}
        			fileService.delete(id);
        		}
        	}        	
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

    @Override
    @Timed @ExceptionMetered
    public long countThingTypesForUser(String userId) {
    	return thingTypeRepository.countByCreatorId(userId);
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

        Page<ManufacturerElastic> result = manufacturerRepository.search(QueryBuilders.queryString(query), new PageRequest(page, size));
        return result.getContent().stream().map(Manufacturer.class::cast).collect(Collectors.toList());
    }

    @Override
    @Timed @ExceptionMetered
    public Manufacturer createManufacturer(Manufacturer manufacturer) {
        log.trace("Invoking create()");
        try {
            Long id = Math.abs(UUID.randomUUID().getMostSignificantBits());
            log.debug("Created ID for document: {}", id);
            manufacturer.setId(id.toString());
            Manufacturer result = manufacturerRepository.index(new ManufacturerElastic(manufacturer));
            URI location = UriBuilder.fromPath("/catalog/manufacturers/{id}").build(result.getId());
            messageContextUtil.addLocationHeader(location.toString());
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

            manufacturer = manufacturerRepository.index(new ManufacturerElastic(manufacturer));
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
