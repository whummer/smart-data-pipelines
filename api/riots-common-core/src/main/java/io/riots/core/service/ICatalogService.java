package io.riots.core.service;

import io.riots.services.catalog.ThingType;

import java.util.List;

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

import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

@Service
@Api(value = "Catalog Service", description = "Catalog service for SmartThings")
public interface ICatalogService {

	@GET
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve single thing from the catalog", notes = "", response = ThingType.class)
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No ThingType found with given id found") })
	@Timed
	@ExceptionMetered
	ThingType retrieveCatalogEntry(@PathParam("id") String thingTypeId);

	@GET
	@Path("/")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve all ThingTypes", notes = "Retrieve all ThingTypes including their children", response = ThingType.class)
	@ApiResponses(value = {
			@ApiResponse(code = 404, message = "No ThingType with given ID found"),
			@ApiResponse(code = 400, message = "Either the query string or the paging parameters are malformed") })
	@Timed
	@ExceptionMetered
	public List<ThingType> list(@QueryParam("q") String query,
			@QueryParam("page") int page, @QueryParam("size") int size);

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
	ThingType create(ThingType thingType);

	@PUT
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Update an existing ThingType", notes = "Update an existing ThingType according to the provided JSON payload. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed ThingType provided. See error message for details") })
	@Timed
	@ExceptionMetered
	ThingType update(ThingType thingType);

	@DELETE
	@Path("/{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Delete a ThingType", notes = "Delete an existing ThingType by its ID. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No such ThingType") })
	@Timed
	@ExceptionMetered
	void delete(@PathParam("id") String thingTypeId);
	
}