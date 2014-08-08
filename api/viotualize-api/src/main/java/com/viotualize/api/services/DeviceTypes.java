package com.viotualize.api.services;

import java.net.URI;

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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.viotualize.api.handlers.command.DeviceTypeCommand;
import com.viotualize.api.handlers.query.DeviceTypeQuery;
import com.viotualize.api.handlers.query.Paged;
import com.viotualize.core.domain.DeviceType;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;


/**
 * @author omoser
 */
@Service
@Path("/device-types")
@Api(value = "DeviceTypes", description = "CRUD operations for DeviceTypes. DeviceTypes are class-based, generic " +
        "entities that can be reused, whereas Devices are instance level representations of physical devices.")
public class DeviceTypes {

    @Autowired
    DeviceTypeQuery deviceTypeQuery;

    @Autowired
    DeviceTypeCommand deviceTypeCommand;

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve single DeviceType",
            notes = "Retrieve DeviceType by its ID. Device IDs are auto-generated by the API upon DeviceType creation " +
                    "and cannot be modified. ",
            response = DeviceType.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No device with given ID found")})
    @Timed
    @ExceptionMetered
    public Response retrieve(@PathParam("id") String deviceTypeId) {
        return Response.ok(deviceTypeQuery.single(deviceTypeId)).build();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve all DeviceTypes",
            notes = "Retrieve all DeviceTypes including their children",
            response = DeviceType.class)
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Either the query string or the paging parameters are malformed")
    })
    @Timed
    @ExceptionMetered
    public Response list(@QueryParam("q") String query, @QueryParam("page") int page, @QueryParam("size") int size) {
        return Response.ok(deviceTypeQuery.query(query, new Paged(page, size))).build();
    }

    @POST
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Created a new DeviceType",
            notes = "Create a new DeviceType according to the provided JSON payload. DeviceType IDs are auto-assigned " +
                    "by the API and cannot be controlled. Upon successful creation, HTTP 201 and a Location header for the" +
                    " created DeviceType is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed DeviceType provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    public Response create(DeviceType deviceType) {
        deviceType = deviceTypeCommand.create(deviceType);
        //String location = UriBuilder.fromMethod(DeviceTypes.class, "retrieve"); // todo check why this is not working
        URI location = UriBuilder.fromPath("/device-types/{id}").build(deviceType.getId());
        return Response.created(location).build();
    }

    @PUT
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Update an existing DeviceType",
            notes = "Update an existing DeviceType according to the provided JSON payload. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed DeviceType provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    public Response update(DeviceType deviceType) {
        deviceTypeCommand.update(deviceType);
        return Response.ok().build();
    }

    @DELETE
    @Path("/{id}")
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Delete a DeviceType",
            notes = "Delete an existing DeviceType by its ID. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No such DeviceType")
    })
    @Timed
    @ExceptionMetered
    public Response delete(@PathParam("id") String deviceTypeId) {
        deviceTypeCommand.delete(deviceTypeId);
        return Response.ok().build();
    }
}
