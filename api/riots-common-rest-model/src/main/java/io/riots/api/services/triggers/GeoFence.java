package io.riots.api.services.triggers;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import io.riots.api.services.model.Location;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.stereotype.Service;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;

/**
 * Represents a geo-fence in the platform.
 * @author whummer
 */
public class GeoFence extends Trigger {
	{
		type = TriggerType.GEO_FENCE;
	}

	/**
	 * Center location of the geo fence.
	 */
	@JsonProperty
	private Location center;

	/**
	 * Diameter of the geo fence.
	 */
	@JsonProperty
	private double diameter;

	public Location getCenter() {
		return center;
	}
	public double getDiameter() {
		return diameter;
	}

	@Override
	public String toString() {
		return "GeoFence [id=" + id + ", created=" + created + ", creatorId="
				+ creatorId + ", center=" + center + ", diameter=" + diameter
				+ "]";
	}

    /**
     * @author whummer
     */
    @Service
    @Path("/triggers")
    @Api(
        value = "Triggers",
        description = "Service which provides various utility trigger functions.")
    public static interface TriggersService {

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
        void removeTrigger(@PathParam("id") String id);

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
}