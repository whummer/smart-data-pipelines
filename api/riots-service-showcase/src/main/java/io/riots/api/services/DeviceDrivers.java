package io.riots.api.services;

import io.riots.core.auth.AuthHeaders;
import io.riots.core.model.driver.DeviceDriver;
import io.riots.core.repositories.DeviceDriverRepository;
import io.riots.services.users.User;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
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
 * @author whummer
 */
@Service
@Path("/drivers")
@Api(value = "Drivers", description = "CRUD operations for DeviceDrivers. "
		+ "DeviceDrivers are components that bridges the virtual "
		+ "device properties to real signals on the wire.")
public class DeviceDrivers {

    @Autowired
    DeviceDriverRepository driverRepo;

    @Autowired
    HttpServletRequest req;

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve single device driver",
            notes = "Retrieve a device driver by its ID.",
            response = DeviceDriver.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No device driver with given ID found")})
    @Timed
    @ExceptionMetered
    public Response retrieve(@PathParam("id") String itemId) {
        return Response.ok(driverRepo.findOne(itemId)).build();
    }

    @GET
    @Path("/forDeviceType/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve drivers for device type.",
            notes = "Retrieve a list of device drivers for a given device type.",
            response = DeviceDriver.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No device driver with given ID found")})
    @Timed
    @ExceptionMetered
    public Response retrieveForDeviceType(@PathParam("id") String itemId) {
    	User user = AuthHeaders.getRequestingUser(req);
        return Response.ok(driverRepo.findByThingTypeAndCreatorOrThingTypeAndCreatorIsNull(itemId, user, itemId)).build();
    }

    @POST
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Created a new DeviceDriver",
            notes = "Create a new DeviceDriver according to the provided JSON payload. "
            		+ "Upon successful creation, HTTP 201 and a Location header for the" +
                    " created DeviceDriver is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed DeviceDriver provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    public Response create(DeviceDriver driver) {
    	User user = AuthHeaders.getRequestingUser(req);
    	driver.setCreator(user);
        driver = driverRepo.save(driver);
        Response r = Response.created(UriBuilder.fromPath(
        		"/drivers/{id}").build(driver.getId())).build();
        return r;
    }

    @PUT
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Update an existing DeviceDriver",
            notes = "Update an existing DeviceDriver according to the "
            		+ "provided JSON payload. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed DeviceDriver provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    public Response update(DeviceDriver driver) {
    	driverRepo.save(driver);
        return Response.ok().build();
    }

    @DELETE
    @Path("/{id}")
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Delete a DeviceDriver",
            notes = "Delete an existing DeviceDriver by its ID. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No such DeviceDriver")
    })
    @Timed
    @ExceptionMetered
    public Response delete(@PathParam("id") String itemId) {
        driverRepo.delete(itemId);
        return Response.ok().build();
    }

}
