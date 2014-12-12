package io.riots.services.catalog.api;

import io.riots.catalog.model.DeviceType;
import io.riots.catalog.repositories.CatalogRepository;
//import io.riots.catalog.repositories.CatalogRepository;
import io.riots.services.model.CatalogEntry;

import java.net.URI;
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
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.query.StringQuery;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

/**
 * Implements the Catalog REST API edge service.
 *
 * @author riox
 */
@Service
@Path("/catalog/things")
@Api(value = "Catalog Service", description = "Catalog service for SmartThings")
public class CatalogService {

    static final Logger log = LoggerFactory.getLogger(CatalogService.class);

    @Autowired
    private CatalogRepository repo;
    
    @Autowired
    private ElasticsearchTemplate searchTemplate;

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve single thing from the catalog", notes = "", response = CatalogEntry.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No catalog entry with given id found")})
    @Timed
    @ExceptionMetered
    public Response retrieveCatalogEntry(@PathParam("id") String deviceTypeId) {
        // TODO implement
        return Response.ok().build();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve all DeviceTypes", notes = "Retrieve all DeviceTypes including their children", response = CatalogEntry.class)
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No DeviceType with given ID found"),
            @ApiResponse(code = 400, message = "Either the query string or the paging parameters are malformed")})
    @Timed
    @ExceptionMetered
    public Response list(@QueryParam("q") String query,
                         @QueryParam("page") int page, @QueryParam("size") int size) {
    	
    	// TODO handle page and size parameter
    	
    	StringQuery sq = new StringQuery(query);
    	List<DeviceType> list = searchTemplate.queryForList(sq, DeviceType.class);
    	
    	for (DeviceType type : list) {
    		System.out.println(type);
    	}
    	
        return Response.ok().build();
    }

    @POST
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
	@ApiOperation(value = "Created a new DeviceType", notes = "Create a new DeviceType according to the provided JSON payload. DeviceType IDs are auto-assigned "
			+ "by the API and cannot be controlled. Upon successful creation, HTTP 201 and a Location header for the"
			+ " created DeviceType is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed DeviceType provided. See error message for details") })
    @Timed
    @ExceptionMetered
    public Response create(CatalogEntry entry) {
        log.trace("Invoking create()");

//        // create a new Hystrix command
//        CreateSmartObjectCommand cmd = context.getBean(CreateSmartObjectCommand.class);
//
//        // set required objects
//        cmd.setSmartObject(entry.getSmartObject());
//
//        SmartObject result = cmd.execute();
//        log.info("result: " + result);
        
        
        DeviceType type = new DeviceType("foo");
        type.setManufacturer("Honeywell");
        type.setName("Rocket");        
        repo.save(type);      
        
        DeviceType type2 = new DeviceType("foo2");
        type.setManufacturer("Honeywell2");
        type.setName("Rocket2");        
        repo.save(type2);    

        URI location = UriBuilder.fromPath("/catalog/entries/{id}").build(1);
        return Response.created(location).build();
    }

    @PUT
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
	@ApiOperation(value = "Update an existing DeviceType", notes = "Update an existing DeviceType according to the provided JSON payload. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed DeviceType provided. See error message for details") })
    @Timed
    @ExceptionMetered
    public Response update(CatalogEntry deviceType) {
        // TODO implement
        return Response.ok().build();
    }

    @DELETE
    @Path("/{id}")
    @Produces({MediaType.APPLICATION_JSON})
	@ApiOperation(value = "Delete a DeviceType", notes = "Delete an existing DeviceType by its ID. Upon success, HTTP 200 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No such DeviceType") })
    @Timed
    @ExceptionMetered
    public Response delete(@PathParam("id") String catalogEntryId) {
        // TODO implement
        return Response.ok().build();
    }
}
