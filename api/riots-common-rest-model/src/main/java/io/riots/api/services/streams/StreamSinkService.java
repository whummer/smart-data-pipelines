package io.riots.api.services.streams;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import org.springframework.stereotype.Service;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;

/**
 * Created by omoser on 09/03/15.
 *
 * @author omoser
 */

@Service
@Path("/stream-sinks")
@Api(value = "StreamSinks", description = "Service for managing data sinks of associated streams.")
public interface StreamSinkService {

	@GET
	@Path("/")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "List DataSinks",
			notes = "List the configured Streams of the requesting user",
			response = Stream.class)
	List<StreamSink> listSinks(@QueryParam("sinkType") String sinkType);

	@GET
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve a Sink", notes = "Loads the StreamSink identified by ID", response = StreamSink.class)
	StreamSink retrieveSink(@PathParam("id") String sinkId);

	@POST
	@Path("/")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Create Stream.", notes = "Set up a DataSink for a Stream.", response = StreamSink.class)
	StreamSink createSink(StreamSink streamSink);

	@PUT
	@Path("/")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Updates a Sink.", notes = "Update an existing Data Sink.", response = StreamSink.class)
	StreamSink updateSink(StreamSink streamSink);

	@DELETE
	@Path("/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Remove a Sink", notes = "Remove an existing Stream")
	void removeSink(@PathParam("id") String sinkId);


}
