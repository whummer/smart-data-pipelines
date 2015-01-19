package io.riots.api.services.drivers;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

/**
 * @author whummer
 */
@Service
@Path("/drivers")
@Api(value = "Drivers", description = "CRUD operations for DataDrivers. "
		+ "DataDrivers are components that bridges the virtual "
		+ "thing properties to real signals on the wire.")
public interface DriversService {

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve single driver",
            notes = "Retrieve a driver by its ID.",
            response = DataDriver.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No driver with given ID found")})
    DataDriver retrieve(@PathParam("id") String itemId);

    @GET
    @Path("/forThingType/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve drivers for thing type.",
            notes = "Retrieve a list of drivers for a given thing type.",
            response = DataDriver.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No driver with given ID found")})
    DataDriver retrieveForThingType(@PathParam("id") String thingTypeId);

    @GET
    @Path("/forThing/{id}/{propName}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve driver for a thing property.",
            notes = "Retrieve data driver for a given thing property.",
            response = DataDriver.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No driver with given ID found")})
    DataDriver retrieveForThing(@PathParam("id") String thingId, @PathParam("propName") String propertyName);

    @PUT
    @Path("/forThing/{id}/{propName}")
    @Consumes({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Create a DataDriver for a thing property",
            notes = "Create a new DataDriver for a thing property according to the provided JSON payload. "
            		+ "Upon successful creation, HTTP 201 and a Location header for the" +
                    " created DataDriver is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed DataDriver provided. See error message for details")
    })
    DataDriver setForThing(@PathParam("id") String thingId, 
    		@PathParam("propName") String propertyName, DataDriver driver);

    @DELETE
    @Path("/{id}")
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Delete a DataDriver",
            notes = "Delete an existing DataDriver by its ID. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No such DataDriver")
    })
    boolean delete(@PathParam("id") String itemId);

}
