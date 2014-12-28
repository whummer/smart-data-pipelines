package io.riots.services.catalog.api;

import io.riots.services.catalog.ThingType;

import java.net.URI;
import java.util.UUID;

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

import org.apache.commons.lang.StringUtils;
import org.elasticsearch.index.query.QueryBuilders;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.YamlMapFactoryBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

/**
 * Implements the simple Image service with a file-based backend
 *
 * @author riox
 */
@Service
@Path("/images")
@Api(value = "Image Service", description = "Image Service")
public class ImageService {

	static final Logger log = LoggerFactory.getLogger(ImageService.class);	
	

	@GET
	@Path("/{id}")
	@ApiOperation(value = "Retrieve single thing from the catalog", notes = "", response = ThingType.class)
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No ThingType found with given id found") })
	@Timed
	@ExceptionMetered
	public Response retrieve(@PathParam("id") String id) {
		System.out.println(System.getProperties());
		return null;		
	}

	@POST
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Creates a new ThingType", notes = "Create a new ThingType according to the provided JSON payload. ThingType IDs are auto-assigned "
			+ "by the API and cannot be controlled. Upon successful creation, HTTP 201 and a Location header for the"
			+ " created ThingType is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed ThingType provided. See error message for details") })
	@Timed
	@ExceptionMetered
	public Response create(ImageData image) {
		return null;
			
	}
	
}
