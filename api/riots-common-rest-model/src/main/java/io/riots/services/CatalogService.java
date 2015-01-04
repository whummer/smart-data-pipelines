package io.riots.services;

import io.riots.services.catalog.Manufacturer;
import io.riots.services.catalog.ThingType;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

@Service
@Path("/catalog")
@Api(value = "Catalog Service", description = "Catalog service for Things")
public interface CatalogService {

	/* THING TYPES */

	@GET
	@Path("/thing-types/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve single thing from the catalog", notes = "", response = ThingType.class)
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No ThingType found with given id found") })
	ThingType retrieveThingType(@PathParam("id") String thingTypeId);

	@GET
	@Path("/thing-types")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve all ThingTypes", notes = "Retrieve all ThingTypes including their children", response = ThingType.class)
	@ApiResponses(value = {
			@ApiResponse(code = 404, message = "No ThingType with given ID found"),
			@ApiResponse(code = 400, message = "Either the query string or the paging parameters are malformed") })
	List<ThingType> listThingTypes(@QueryParam("q") String query,
			@QueryParam("page") int page, @QueryParam("size") int size);

	@POST
	@Path("/thing-types")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Creates a new ThingType", notes = "Create a new ThingType according to the provided JSON payload. ThingType IDs are auto-assigned "
			+ "by the API and cannot be controlled. Upon successful creation, HTTP 201 and a Location header for the"
			+ " created ThingType is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed ThingType provided. See error message for details") })
	ThingType createThingType(ThingType thingType);

	@PUT
	@Path("/thing-types")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Update an existing ThingType", notes = "Update an existing ThingType according to the provided JSON payload. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed ThingType provided. See error message for details") })
	ThingType updateThingType(ThingType thingType);

	@DELETE
	@Path("/thing-types/{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Delete a ThingType", notes = "Delete an existing ThingType by its ID. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No such ThingType") })
	void deleteThingType(@PathParam("id") String thingTypeId);

	@GET
	@Path("/thing-types/count")
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Count ThingTypes", notes = "Get the number of ThingTypes stored in the catalog.")
	long countThingTypes();

	/* MANUFACTURERS */

	@GET
	@Path("/manufacturers/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve single manufacturer from the catalog", notes = "", response = Manufacturer.class)
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No Manufacturer found with given id found") })
	Manufacturer retrieveManufacturer(@PathParam("id") String manufacturerId);

	@GET
	@Path("/manufacturers")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve all Manufacturers", notes = "Retrieve all Manufacturers", response = Manufacturer.class)
	@ApiResponses(value = {
			@ApiResponse(code = 404, message = "No Manufacturer with given ID found"),
			@ApiResponse(code = 400, message = "Either the query string or the paging parameters are malformed") })
	public List<Manufacturer> listManufacturers(@QueryParam("q") String query,
			@QueryParam("page") int page, @QueryParam("size") int size);

	@POST
	@Path("/manufacturers")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Creates a new Manufacturer", notes = "Create a new Manufacturer according to the provided JSON payload. Manufacturer IDs are auto-assigned "
			+ "by the API and cannot be controlled. Upon successful creation, HTTP 201 and a Location header for the"
			+ " created Manufacturer is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed Manufacturer provided. See error message for details") })
	Manufacturer createManufacturer(Manufacturer manufacturer);

	@PUT
	@Path("/manufacturers")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Update an existing Manufacturer", notes = "Update an existing Manufacturer according to the provided JSON payload. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed Manufacturer provided. See error message for details") })
	Manufacturer updateManufacturer(Manufacturer manufacturer);

	@DELETE
	@Path("/manufacturers/{id}")
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Delete a Manufacturer", notes = "Delete an existing Manufacturer by its ID. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No such Manufacturer") })
	void deleteManufacturer(@PathParam("id") String manufacturerId);

}
