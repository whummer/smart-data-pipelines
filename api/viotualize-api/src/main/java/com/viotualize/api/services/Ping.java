package com.viotualize.api.services;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

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
    public Response ping() {
        return Response.ok("pong").build();
    }
}
