package com.viotualize.catalog.service;

import java.net.URI;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.viotualize.catalog.command.CatalogCommand;
import com.viotualize.catalog.core.CatalogEntry;
import com.viotualize.core.domain.DeviceType;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

/**
 * @author riox
 */
@Service
@Path("/catalog/entries")
@Api(value = "Catalog Service", description = "Catalog service for SmartObjects")
public class CatalogService {

	@Autowired
	CatalogCommand catalogCommand;

	@GET
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve single Catalog entry", notes = "", response = CatalogEntry.class)
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No catalog entry with given id found") })
	@Timed
	@ExceptionMetered
	public Response retrieveEntry(@PathParam("id") String deviceTypeId) {
		return Response.ok().build();
	}

	@GET
	@Path("/")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve all DeviceTypes", notes = "Retrieve all DeviceTypes including their children", response = DeviceType.class)
	@ApiResponses(value = {
			@ApiResponse(code = 404, message = "No DeviceType with given ID found"),
			@ApiResponse(code = 400, message = "Either the query string or the paging parameters are malformed") })
	@Timed
	@ExceptionMetered
	public Response list(@QueryParam("q") String query,
			@QueryParam("page") int page, @QueryParam("size") int size) {
		return Response.ok().build();
	}

	@POST
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Created a new DeviceType", notes = "Create a new DeviceType according to the provided JSON payload. DeviceType IDs are auto-assigned "
			+ "by the API and cannot be controlled. Upon successful creation, HTTP 201 and a Location header for the"
			+ " created DeviceType is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed DeviceType provided. See error message for details") })
	@Timed
	@ExceptionMetered
	public Response create(CatalogEntry deviceType) {		
		//deviceType = deviceTypeCommand.create(deviceType);
		URI location = UriBuilder.fromPath("/device-types/{id}").build("");
		return Response.created(location).build();
	}

	@PUT
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Update an existing DeviceType", notes = "Update an existing DeviceType according to the provided JSON payload. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed DeviceType provided. See error message for details") })
	@Timed
	@ExceptionMetered
	public Response update(CatalogEntry deviceType) {
		//deviceTypeCommand.update(deviceType);
		return Response.ok().build();
	}

	@DELETE
	@Path("/{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Delete a DeviceType", notes = "Delete an existing DeviceType by its ID. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No such DeviceType") })
	@Timed
	@ExceptionMetered
	public Response delete(@PathParam("id") String catalogEntryId) {
		//deviceTypeCommand.delete(deviceTypeId);
		return Response.ok().build();
	}
}
