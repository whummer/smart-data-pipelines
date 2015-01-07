package io.riots.services;

import io.riots.services.apps.Application;

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
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

@Service
@Path("/apps")
@Api(value = "Applications Service", description = "Service for user applications in the platform.")
public interface ApplicationsService {

	@GET
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve application", 
		notes = "Retrieve information about an application with the given ID.", response = Application.class)
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No application with given ID found") })
	Application retrieve(@PathParam("id") String id);

	@GET
	@Path("/by/appKey/{appKey}")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve application by appKey", 
		notes = "Retrieve information about an application with the given appKey.", response = Application.class)
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No application with given appKey found") })
	Application retrieveByAppKey(@PathParam("appKey") String appKey);

	@GET
	@Path("")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve all applications",
		notes = "Retrieve all applications.", response = Application.class)
	List<Application> list();

	@POST
	@Path("")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Creates a new Application", 
		notes = "Create a new Application according to the provided JSON payload. "
				+ "Upon successful creation, HTTP 201 and a Location header for the"
				+ " created Application is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed Application provided. See error message for details") })
	Application create(Application item);

	@PUT
	@Path("")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Update an existing Application", 
		notes = "Update an existing Application according to the provided JSON payload. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed Application provided. See error message for details") })
	Application update(Application item);

	@DELETE
	@Path("/{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Delete an Application", notes = "Delete an existing Application by its ID. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No such Application") })
	void delete(@PathParam("id") String id);

}
