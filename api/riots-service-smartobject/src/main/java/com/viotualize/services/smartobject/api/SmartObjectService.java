package com.viotualize.services.smartobject.api;

import java.net.URI;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;

import com.viotualize.core.handlers.command.SmartObjectRepositoryCommands;
import com.viotualize.core.handlers.query.Paged;
import com.viotualize.core.handlers.query.SmartObjectRepositoryQueries;
import com.viotualize.core.mapping.RestObjectMapper;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.viotualize.services.model.SmartObject;
import com.wordnik.swagger.annotations.Api;

/**
 * @author riox
 */
@Service
@Path("/smartobjects/")
@Api(value = "SmartObject Service", description = "Service for managing SmartObjects")
public class SmartObjectService {

    static final Logger log = LoggerFactory.getLogger(SmartObjectService.class);

    @Autowired
    private SmartObjectRepositoryCommands commands;

    @Autowired
    private SmartObjectRepositoryQueries queries;

    @Autowired
    private RestObjectMapper<SmartObject, com.viotualize.core.repositories.domain.SmartObject> mapper;

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve single Catalog entry", notes = "", response = SmartObject.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No catalog entry with given id found")})
    @Timed
    @ExceptionMetered
    public Response get(@PathParam("id") String id) {
        return Response.ok(queries.single(id)).build();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(
            value = "Retrieve all SmartObjects",
            notes = "Retrieve all SmartObjects including their children",
            response = SmartObject.class)
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No SmartObject with given ID found"),
            @ApiResponse(code = 400, message = "Either the query string or the paging parameters are malformed")})
    @Timed
    @ExceptionMetered
    public Response list(@QueryParam("q") String query, @QueryParam("page") int page, @QueryParam("size") int size) {
        return Response.ok(queries.query(query, new Paged(page, size))).build();
    }

    @POST
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(
            value = "Created a new SmartObject",
            notes = "Create a new SmartObject according to the provided " +
                    "JSON payload. SmartObject IDs are auto-assigned "
                    + "by the API and cannot be controlled. Upon successful creation, HTTP 201 and a Location header for the"
                    + " created SmartObject is returned.")
    @ApiResponses({@ApiResponse(code = 400, message = "Malformed SmartObject provided. See error message for details")})
    @Timed
    @ExceptionMetered
    public Response create(SmartObject smo) {
        log.trace("Invoking create()");
        com.viotualize.core.repositories.domain.SmartObject domainObject = commands.create(
                mapper.map(smo, com.viotualize.core.repositories.domain.SmartObject.class));

        URI location = UriBuilder.fromPath("/smartobjects/{id}").build(domainObject.getId());
        return Response.created(location).build();
    }

    @PUT
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(
            value = "Update an existing SmartObject",
            notes = "Update an existing SmartObject according to the provided JSON payload. Upon success, HTTP 200 is returned.")
    @ApiResponses({@ApiResponse(code = 400, message = "Malformed SmartObject provided. See error message for details")})
    @Timed
    @ExceptionMetered
    public Response update(SmartObject smo) {
        //SmartObjectCommand.update(SmartObject);
        return Response.ok().build();
    }

    @DELETE
    @Path("/{id}")
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(
            value = "Delete a SmartObject",
            notes = "Delete an existing SmartObject by its ID. Upon success, HTTP 200 is returned.")
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No such SmartObject")})
    @Timed
    @ExceptionMetered
    public Response delete(@PathParam("id") String smartObjectId) {
        commands.delete(smartObjectId);
        return Response.ok().build();
    }
}
