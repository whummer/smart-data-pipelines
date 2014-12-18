package io.riots.services.catalog.api;

import io.riots.catalog.repositories.ThingTypeRepository;
import io.riots.core.service.ICatalogService;
import io.riots.core.service.ServiceUtils;
import io.riots.services.catalog.ThingType;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Path;
import javax.ws.rs.core.UriBuilder;

import org.apache.commons.lang.StringUtils;
import org.elasticsearch.index.query.QueryBuilders;
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
@Path("/catalog/thing-types")
public class CatalogService implements ICatalogService {

	static final Logger log = LoggerFactory.getLogger(CatalogService.class);
	
	@Autowired
	ThingTypeRepository repository;

	@Autowired
	ElasticsearchTemplate searchTemplate;

	@Override
	public ThingType retrieveCatalogEntry(String thingTypeId) {
		if (repository.exists(thingTypeId)) {
			ThingType tt = repository.findOne(thingTypeId);
			return tt;
		} else { 
			ServiceUtils.setResponseStatus(404);
			return null;
		}
	}


	@Override
	public List<ThingType> list(String query, int page, int size) {
		
		// set reasonable defaults
		if (StringUtils.isEmpty(query))
			query = "*:*";	
		if (page <= 0)
			page = 0;		
		if (size <= 0)
			size = 100;

		Page<ThingType> result = repository.search(
				QueryBuilders.queryString(query),
				new PageRequest(page, size));

		return result.getContent();
	}


	@Override
	public ThingType create(ThingType thingType) {
		log.trace("Invoking create()");
		try {
			Long id = Math.abs(UUID.randomUUID().getMostSignificantBits());
			thingType.setId(id.toString());
			ThingType result = repository.index(thingType);
			URI location = UriBuilder.fromPath("/catalog/things/{id}").build(result.getId());
			ServiceUtils.setHeaderLocation(location);
			return result;	
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			ServiceUtils.setResponseStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return null;
		}
	}

	@Override
	public ThingType update(ThingType thingType) {
		try {
			if (StringUtils.isEmpty(thingType.getId())) {
				throw new IllegalArgumentException("id not present");
			}
			thingType = repository.index(thingType);
			return thingType;
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			ServiceUtils.setResponseStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return null;
		}
	}

	@Override
	public void delete(String thingTypeId) {
		if (repository.exists(thingTypeId)) {
			repository.delete(thingTypeId);
		} else { 
			ServiceUtils.setResponseStatus(HttpServletResponse.SC_NOT_FOUND);
		}
	}
}
