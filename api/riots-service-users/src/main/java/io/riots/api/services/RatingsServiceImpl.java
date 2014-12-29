package io.riots.api.services;

import io.riots.api.handlers.command.RatingCommand;
import io.riots.api.handlers.query.RatingQuery;
import io.riots.api.handlers.query.UserQuery;
import io.riots.services.users.Rating;
import io.riots.services.users.Rating.RatingAggregated;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * @author whummer
 */
@Service
@Path("/ratings")
@Api(value = "Ratings", description = "Generic service for ratings.")
public class RatingsServiceImpl {

    @Autowired
    RatingQuery ratingQuery;
    @Autowired
    UserQuery userQuery;

    @Autowired
    RatingCommand ratingCommand;

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve aggregated rating for an ID",
            notes = "Retrieve aggregated rating for an ID",
            response = RatingAggregated.class)
    @Timed
    @ExceptionMetered
    public Response retrieve(@PathParam("id") String thingID) {
    	Rating r = ratingQuery.aggregated(thingID);
    	//System.out.println("Aggregated rating: " + r);
        return Response.ok(r).build();
    }

    @POST
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Create or update a Rating",
            notes = "Create or update a Rating."
    )
    @Timed
    @ExceptionMetered
    public Response create(Rating r) {
        r.user = userQuery.findOrCreateByEmail(r.user.getEmail());
        Rating existing = ratingQuery.single(r.thing, r.user);
        if(existing != null) {
        	existing.rating = r.rating;
        	existing.min = r.min;
        	existing.max = r.max;
            ratingCommand.update(existing);
        } else {
            ratingCommand.create(r);
        }
        return Response.ok().build();
    }

}
