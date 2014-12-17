package io.riots.api.services;

import io.riots.api.handlers.command.DeviceCommand;
import io.riots.api.handlers.query.DeviceQuery;
import io.riots.api.handlers.query.Paged;
import io.riots.core.auth.AuthFilter;
import io.riots.core.model.Device;
import io.riots.core.model.DeviceType;
import io.riots.core.repositories.UserRepository;

import javax.servlet.http.HttpServletRequest;
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
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

/**
 * @author omoser
 * @author whummer
 */
@Service
@Path("/devices")
@Api(value = "Devices", description = "CRUD operations for Devices. Devices are virtual representations of physical " +
        "devices, such as sensors, actuators or appliances. Each Device has a specific DeviceType that has to be " +
        "created using the DeviceTypes service before the Device can be created")
public class Devices {

    @Autowired
    DeviceQuery deviceQuery;
    @Autowired
    DeviceCommand deviceCommand;

	@Autowired
	UserRepository userRepo;
    @Autowired
    HttpServletRequest req;

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve single device",
            notes = "Retrieve device by its ID. Device IDs are auto-generated by the API and cannot be modified",
            response = Device.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No device with given ID found")})
    @Timed
    @ExceptionMetered
    public Response retrieve(@PathParam("id") String deviceId) {
        return Response.ok(deviceQuery.single(deviceId)).build();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve all Devices",
            notes = "Retrieve all Devices including their children",
            response = DeviceType.class)
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No Device with given ID found"),
            @ApiResponse(code = 400, message = "Either the query string or the paging parameters are malformed")
    })
    @Timed
    @ExceptionMetered
    public Response list(@QueryParam("q") String query, @QueryParam("page") int page, @QueryParam("size") int size) {
        return Response.ok(deviceQuery.query(query, new Paged(page, size))).build();
    }

    @POST
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Created a new Device",
            notes = "Create a new Device according to the provided JSON payload. Device IDs are auto-assigned " +
                    "by the API and cannot be controlled. Please note that referenced DeviceTypes have to exist prior " +
                    "to persisting a Device.Upon successful creation, HTTP 201 and a Location header for the" +
                    " created Device is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed Device provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    public Response create(Device device) {
    	device.setCreator(AuthFilter.getRequestingUser(req, userRepo));
        device = deviceCommand.create(device);
        Response r = Response.created(UriBuilder.fromPath(
        		"/devices/{id}").build(device.getId())).build();
        return r;
    }

    @PUT
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Update an existing Device",
            notes = "Update an existing Device according to the provided JSON payload. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed Device provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    public Response update(Device device) {
    	
        deviceCommand.update(device);
        return Response.ok().build();
    }

    @DELETE
    @Path("/{id}")
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Delete a Device",
            notes = "Delete an existing Device by its ID. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No such DeviceType")
    })
    @Timed
    @ExceptionMetered
    public Response delete(@PathParam("id") String deviceId) {
        deviceCommand.delete(deviceId);
        return Response.ok().build();
    }


}
