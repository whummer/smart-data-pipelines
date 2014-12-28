package io.riots.api.services;

import io.riots.api.model.BaseObjectCategorized;
import io.riots.api.model.Manufacturer;
import io.riots.api.model.SemanticType;
import io.riots.core.repositories.ManufacturerRepository;
import io.riots.core.repositories.SemanticTypeRepository;

import java.net.URISyntaxException;

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
@Path("/semantic-types")
@Api(value = "SemanticTypes", 
	description = "Manage metadata for semantic types (e.g., property types, device types.")
@SuppressWarnings("all")
public class SemanticTypes {

    @Autowired
	SemanticTypeRepository baseRepo;
    @Autowired
	ManufacturerRepository manuRepo;

    @GET
    @Path("/{category}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve semantic types for a specific category (e.g., 'Property', 'Device')",
            notes = "Retrieve aggregated rating for an ID",
            response = SemanticType.class)
    @Timed
    @ExceptionMetered
    public Response retrieve(@PathParam("category") String category) {
    	return Response.ok(baseRepo.findByCategory(category)).build();
    }

    @POST
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Create a semantic type",
            notes = "Create a new semantic type."
    )
    @Timed
    @ExceptionMetered
    public Response create(BaseObjectCategorized t) throws URISyntaxException {
    	if(t instanceof SemanticType) {
            t = baseRepo.save((SemanticType)t);
    	} else if(t instanceof Manufacturer) {
            t = manuRepo.save((Manufacturer)t);
    	} else {
    		throw new IllegalArgumentException("Expected semantic type or manufacturer.");
    	}
    	return Response.created(UriBuilder.fromPath(
        		"/semantic-types/{id}").build(t.getId())).build();
    }

    @PUT
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Update a semantic type",
            notes = "Update a semantic type."
    )
    @Timed
    @ExceptionMetered
    public Response update(BaseObjectCategorized t) throws URISyntaxException {
    	if(t instanceof SemanticType) {
            t = baseRepo.save((SemanticType)t);
    	} else if(t instanceof Manufacturer) {
            t = manuRepo.save((Manufacturer)t);
    	} else {
    		throw new IllegalArgumentException("Expected semantic type or manufacturer.");
    	}
        return Response.ok().build();
    }

    @DELETE
    @Path("/{id}")
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Delete a semantic type.",
            notes = "Delete an existing SemanticType instance by its ID. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No such SemanticType")
    })
    @Timed
    @ExceptionMetered
    public Response delete(@PathParam("id") String itemId) {
    	baseRepo.delete(itemId);
        return Response.ok().build();
    }

}
