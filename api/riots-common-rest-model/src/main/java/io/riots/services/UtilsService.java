package io.riots.services;

import java.util.List;

import io.riots.services.utils.GeoFence;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * @author whummer
 */
@Service
@Api(value = "Utils", description = "Service which provides various utility functions.")
public interface UtilsService {

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
