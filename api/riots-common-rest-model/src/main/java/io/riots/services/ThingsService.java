package io.riots.services;

import io.riots.services.catalog.ThingType;
import io.riots.services.scenario.Thing;

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

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

/**
 * Service interface for "things service".
 * @author whummer
 */
@Service
@Api(value = "Things", description = "Service for managing things.")
public interface ThingsService {

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve single thing",
            notes = "Retrieve things by ID. Thing IDs are auto-generated by the API and cannot be modified",
            response = Thing.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No thing with given ID found")})
    Thing retrieve(@PathParam("id") String thingId);

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve all Things",
            notes = "Retrieve all Things including their children",
            response = ThingType.class)
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No Thing with given ID found"),
            @ApiResponse(code = 400, message = "Either the query string or the paging parameters are malformed")
    })
    List<Thing> list(@QueryParam("q") String query, @QueryParam("page") int page, @QueryParam("size") int size);

    @POST
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Created a new Thing",
            notes = "Create a new Thing according to the provided JSON payload. Thing IDs are auto-assigned " +
                    "by the API and cannot be controlled. Please note that referenced ThingTypes have to exist prior " +
                    "to persisting a Thing. Upon successful creation, HTTP 201 and a Location header for the" +
                    " created Thing is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed Thing provided. See error message for details")
    })
    Thing create(Thing thing);

    @PUT
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Update an existing Thing",
            notes = "Update an existing Thing according to the provided JSON payload. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed Thing provided. See error message for details")
    })
    Thing update(Thing thing);

    @DELETE
    @Path("/{id}")
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Delete a Thing",
            notes = "Delete an existing Thing by its ID. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No such Thing")
    })
    boolean delete(@PathParam("id") String thingId);

}