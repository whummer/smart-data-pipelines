package com.viotualize.services.environment.api;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.viotualize.core.handlers.query.Paged;
import com.viotualize.core.model.Environment;
import com.viotualize.core.handlers.command.EnvironmentRepositoryCommands;
import com.viotualize.core.handlers.query.EnvironmentRepositoryQueries;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;
import java.net.URI;

/**
 * @author omoser
 */
@Service
@Path("/environments")
@Api(value = "Environments", description = "CRUD operations for Environments")
public class Environments {

    @Autowired
    EnvironmentRepositoryQueries environmentQuery;

    @Autowired
    EnvironmentRepositoryCommands environmentCommands;

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve single Environments", notes = "Retrieve Environments by its ID. Device IDs are auto-generated by the API upon Environment creation "
            + "and cannot be modified. ", response = Environment.class)
    @ApiResponses(value = { @ApiResponse(code = 404, message = "No device with given ID found") })
    @Timed
    @ExceptionMetered
    public Response retrieve(@PathParam("id") String EnvironmentId) {
        return Response.ok(environmentQuery.single(EnvironmentId)).build();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve all Environments", notes = "Retrieve all Environments including their children", response = Environment.class)
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No Environment with given ID found"),
            @ApiResponse(code = 400, message = "Either the query string or the paging parameters are malformed") })
    @Timed
    @ExceptionMetered
    public Response list(@QueryParam("q") String query,
                         @QueryParam("page") int page, @QueryParam("size") int size) {
        return Response.ok(environmentQuery.query(query, new Paged(page, size))).build();
    }

    @POST
    @Path("/")
    @Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
    @ApiOperation(value = "Created a new Environment", notes = "Create a new Environment according to the provided JSON payload. Environment IDs are auto-assigned "
            + "by the API and cannot be controlled. Upon successful creation, HTTP 201 and a Location header for the"
            + " created Environment is returned.")
    @ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed Environment provided. See error message for details") })
    @Timed
    @ExceptionMetered
    public Response create(Environment Environment) {
        Environment = environmentCommands.create(Environment);
        URI location = UriBuilder.fromPath("/device-types/{id}").build(
                Environment.getId());
        return Response.created(location).build();
    }

    @PUT
    @Path("/")
    @Consumes({ MediaType.APPLICATION_JSON })
    @Produces({ MediaType.APPLICATION_JSON })
    @ApiOperation(value = "Update an existing Environment", notes = "Update an existing Environment according to the provided JSON payload. Upon success, HTTP 200 is returned.")
    @ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed Environment provided. See error message for details") })
    @Timed
    @ExceptionMetered
    public Response update(Environment Environment) {
        environmentCommands.update(Environment);
        return Response.ok().build();
    }

    @DELETE
    @Path("/{id}")
    @Produces({ MediaType.APPLICATION_JSON })
    @ApiOperation(value = "Delete a Environment", notes = "Delete an existing Environment by its ID. Upon success, HTTP 200 is returned.")
    @ApiResponses(value = { @ApiResponse(code = 404, message = "No such Environment") })
    @Timed
    @ExceptionMetered
    public Response delete(@PathParam("id") String EnvironmentId) {
        environmentCommands.delete(EnvironmentId);
        return Response.ok().build();
    }
}
