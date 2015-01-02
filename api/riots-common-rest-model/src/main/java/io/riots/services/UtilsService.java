package io.riots.services;

import io.riots.services.model.Location;
import io.riots.services.model.interfaces.ObjectCreated;
import io.riots.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * @author whummer
 */
@Service
@Api(value = "Utils", description = "Service which provides various utility functions.")
public interface UtilsService {

	public static class GeoFence implements ObjectCreated, ObjectIdentifiable {

		@JsonProperty
		private String id;
		@JsonProperty
		private Date created;
		@JsonProperty
		private String creatorId;

		@JsonProperty
		private Location center;
		@JsonProperty
		private double diameter;

		// TODO: define which things are affected by the geo fence, i.e.,
		// which things we want to continuously monitor...
//		@JsonProperty
//		private List<String> affectedThings;

		public String getId() {
			return id;
		}
		public void setId(String id) {
			this.id = id;
		}
		public Location getCenter() {
			return center;
		}
		public double getDiameter() {
			return diameter;
		}
		public Date getCreated() {
			return created;
		}
		public String getCreatorId() {
			return creatorId;
		}
		public void setCreated(Date created) {
			this.created = created;
		}
		public void setCreatorId(String creatorId) {
			this.creatorId = creatorId;
		}
	}

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
