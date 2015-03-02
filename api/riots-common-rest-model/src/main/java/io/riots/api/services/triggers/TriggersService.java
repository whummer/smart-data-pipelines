package io.riots.api.services.triggers;

import java.util.List;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * Service for managing trigger functions in the platform.
 * @author whummer
 */
@Service
@Path("/triggers")
@Api(
    value = "Triggers",
    description = "Service which provides various utility trigger functions.")
public interface TriggersService {

    /* GENERIC FUNCTIONS FOR TRIGGERS */

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List triggers.",
            notes = "List currently configured triggers.",
            response = Trigger.class)
    List<Trigger> listTriggers();

    @POST
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Create trigger.",
            notes = "Set up a trigger.",
            response = Trigger.class)
    Trigger setupTrigger(Trigger t);

    @PUT
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Update trigger.",
            notes = "Update an existing trigger.",
            response = Trigger.class)
    Trigger updateTrigger(Trigger t);

    @DELETE
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Remove trigger",
            notes = "Remove an existing trigger")
    void removeTrigger(@PathParam("id") String id, @QueryParam("creatorId") String creatorId);

	@DELETE
    @Path("/")
    @ApiOperation(value = "Remove triggers",
            notes = "Remove triggers based on query parameters")
    void removeTrigger(@QueryParam("creatorId") String creatorId);

    /* SPECIALIZED FUNCTIONS FOR GEO FENCES */

    @GET
    @Path("/geo/fence")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List current geo fences.",
            notes = "List geo fences currently configured.",
            response = GeoFence.class)
    List<GeoFence> listGeoFences();

    @POST
    @Path("/geo/fence")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Create geo fence.",
            notes = "Set up a geo fence.",
            response = GeoFence.class)
    GeoFence setupGeoFence(GeoFence fence);

    @DELETE
    @Path("/geo/fence/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve aggregated rating for an ID",
            notes = "Retrieve aggregated rating for an ID")
    void removeGeoFence(@PathParam("id") String id);

}
