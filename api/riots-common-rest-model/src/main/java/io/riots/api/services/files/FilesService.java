package io.riots.api.services.files;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MediaType;

import org.apache.cxf.jaxrs.ext.multipart.Attachment;
import org.apache.cxf.jaxrs.ext.multipart.Multipart;
import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

import java.io.InputStream;

/**
 * Implements the simple file clients with a file-based backend
 *
 * @author riox
 */
@Service
@Path("/files")
@Api(value = "File Service", description = "Simple File Service")
public interface FilesService {	
	
	@GET
	@Path("/{id}")
	@ApiOperation(value = "Retrieve single file from the file store", notes = "", response = byte[].class)
	@ApiResponses(value = { @ApiResponse(code = 404, message = "No file found with given id found") })	
	public InputStream retrieve(@PathParam("id") String id);

	@POST
	@Path("/upload")
	@Consumes({ MediaType.MULTIPART_FORM_DATA })
	@ApiOperation(value = "Creates a new file", notes = "Create a new file via a mulipart upload. IDs are auto-assigned "
			+ "by the API and cannot be controlled. Upon successful creation, HTTP 201 and a Location header for the"
			+ " created file is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed file provided. See error message for details") })	
	public String upload(@Multipart(value = "name") String name,
			@Multipart(value = "filedata") Attachment attr);
	
	@POST
	@Path("/")
	@Consumes({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Creates a new file from a base64 representation", notes = "Create a new file from a base64 encoded string. IDs are auto-assigned "
			+ "by the API and cannot be controlled. Upon successful creation, HTTP 201 and a Location header for the"
			+ " created file is returned.")
	@ApiResponses(value = { @ApiResponse(code = 400, message = "Malformed file provided. See error message for details") })	
	public String create(FileData data);
	
	@DELETE
	@Path("/{id}")
	@Consumes({ MediaType.APPLICATION_JSON })
	@ApiOperation(value = "Deletes a file with a given ID", notes = "Upon sucessful completion, a 204 is returned.")
	@ApiResponses(value = { @ApiResponse(code = 404, message = "File with the given ID does not exist.") })	
	public void delete(@PathParam(value = "id") String id);
		
}
