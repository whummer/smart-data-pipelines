package io.riots.core.service;

import io.riots.services.scenario.PropertyValue;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

/**
 * Service interface for "things service".
 * @author whummer
 */
@Service
@Api(value = "ThingData", description = "Service for managing thing data.")
public interface IThingData {

	@GET
    @Path("/{thingID}/{propertyName}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve thing property value",
            notes = "Retrieve the last data of a given thing property",
            response = PropertyValue.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No thing with given ID found")})
    @Timed
    @ExceptionMetered
    public PropertyValue<?> retrieve(
    		@PathParam("thingID") String thingId,
    		@PathParam("propertyName") String propertyName);

    @GET
    @Path("/{thingID}/{propertyName}/history")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve thing property values",
            notes = "Retrieve a history of the last X (amount) data items of a given thing property",
            response = PropertyValue.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No thing with given ID found")})
    @Timed
    @ExceptionMetered
    public List<PropertyValue<?>> retrieve(
    		@PathParam("thingID") String thingId,
    		@PathParam("propertyName") String propertyName,
    		@QueryParam("amount") int amount);

    @POST
    @Path("/{thingID}/{propertyName}")
    @Consumes({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Post a thing data entry.",
            notes = "Post a thing data entry."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed thing data provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    @SuppressWarnings("all")
	public void postValue(@PathParam("thingID") String thingId,
    		@PathParam("propertyName") String propertyName, 
    		PropertyValue<?> propValue);

}