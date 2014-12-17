package io.riots.services.catalog.api;

import io.riots.catalog.repositories.CatalogRepository;
import io.riots.core.auth.AuthFilter;
import io.riots.services.catalog.ThingType;

import java.net.URI;
import java.util.UUID;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;

import org.apache.commons.lang.StringUtils;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.QueryStringQueryBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.query.SearchQuery;
import org.springframework.stereotype.Service;

import scala.tools.nsc.interpreter.Results;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

/**
 * Implements the Catalog REST API edge service.
 *
 * @author riox
 */
@Service
@Path("/catalog/things")
@Api(value = "Catalog Service", description = "Catalog service for SmartThings")
public class CatalogService {

	static final Logger log = LoggerFactory.getLogger(CatalogService.class);
	
	@Autowired
	CatalogRepository repository;

	@Autowired
	ElasticsearchTemplate searchTemplate;

	@GET
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve single thing from the catalog", notes = "", response = ThingType.class)
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No ThingType found with given id found") })
	@Timed
	@ExceptionMetered
	public Response retrieveCatalogEntry(@PathParam("id") String thingTypeId) {
		if (repository.exists(thingTypeId)) {
			ThingType tt = repository.findOne(thingTypeId);
			return Response.ok().entity(tt).build();
		} else { 
			return Response.status(404).build();
		}
	}

	@GET
	@Path("/")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve all ThingTypes", notes = "Retrieve all ThingTypes including their children", response = ThingType.class)
	@ApiResponses(value = {
			@ApiResponse(code = 404, message = "No ThingType with given ID found"),
			@ApiResponse(code = 400, message = "Either the query string or the paging parameters are malformed") })
	@Timed
	@ExceptionMetered
	public Response list(@QueryParam("q") String query,
			@QueryParam("page") int page, @QueryParam("size") int size) {
		
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
		
		if (result.getNumberOfElements() == 0) {
			return Response.status(404).build();
		}		
		return Response.ok().entity(result.getContent()).build();
	}

	@POST
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Creates a new ThingType", notes = "Create a new ThingType according to the provided JSON payload. ThingType IDs are auto-assigned "
			+ "by the API and cannot be controlled. Upon successful creation, HTTP 201 and a Location header for the"
			+ " created ThingType is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed ThingType provided. See error message for details") })
	@Timed
	@ExceptionMetered
	public Response create(ThingType thingType) {
		log.trace("Invoking create()");
		try {
			Long id = Math.abs(UUID.randomUUID().getMostSignificantBits());
			thingType.setId(id.toString());
			ThingType result = repository.index(thingType);
			URI location = UriBuilder.fromPath("/catalog/things/{id}").build(result.getId());
			return Response.created(location).build();		
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			return Response.serverError().entity(e.getMessage()).build();
		}
	}

	@PUT
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Update an existing ThingType", notes = "Update an existing ThingType according to the provided JSON payload. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed ThingType provided. See error message for details") })
	@Timed
	@ExceptionMetered
	public Response update(ThingType thingType) {
		try {
			if (StringUtils.isEmpty(thingType.getId())) {
				return Response.status(400).entity("{ 'message': 'id not present'").build();
			}
			repository.index(thingType);
			return Response.ok().build();		
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			return Response.serverError().entity(e.getMessage()).build();
		}
	}

	@DELETE
	@Path("/{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Delete a ThingType", notes = "Delete an existing ThingType by its ID. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No such ThingType") })
	@Timed
	@ExceptionMetered
	public Response delete(@PathParam("id") String thingTypeId) {
		if (repository.exists(thingTypeId)) {
			repository.delete(thingTypeId);		
			return Response.ok().build();
		} else { 
			return Response.status(404).build();
		}
	}
}
