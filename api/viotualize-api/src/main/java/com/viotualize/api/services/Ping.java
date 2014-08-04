package com.viotualize.api.services;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;
import org.springframework.stereotype.Service;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * @author omoser
 */
@Service
@Path("/ping")
@Api(value = "/ping", description = "API ping")
public class Ping {


    @GET
    @Path("/")
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "ping the API",
            notes = "If everything is fine, returns the string 'pong'",
            response = String.class
    )
    @Timed
    @ExceptionMetered
    public Response ping() {
        return Response.ok("pong").build();
    }
}
