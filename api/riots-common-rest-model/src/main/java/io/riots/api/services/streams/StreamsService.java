package io.riots.api.services.streams;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * Service for managing data streams in the platform.
 * @author whummer
 */
@Service
@Path("/streams")
@Api(
    value = "Streams",
    description = "Service for managing data streams.")
public interface StreamsService {

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List Streams.",
            notes = "List currently configured Streams.",
            response = Stream.class)
    List<Stream> listStreams();

    @POST
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Create Stream.",
            notes = "Set up a Stream.",
            response = Stream.class)
    Stream addStream(Stream t);

    @PUT
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Update Stream.",
            notes = "Update an existing Stream.",
            response = Stream.class)
    Stream updateStream(Stream t);

    @DELETE
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Remove Stream",
            notes = "Remove an existing Stream")
    void removeStream(@PathParam("id") String id);

}
