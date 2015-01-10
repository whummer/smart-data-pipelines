package io.riots.services;

import io.riots.services.users.Role;
import io.riots.services.users.User;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * Interface for users service.
 * @author whummer
 */
@Service
@Path("/users")
@Api(value = "Users", description = "Service for managing users in the systems.")
public interface UsersService {

	@GET
    @Path("/me")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Return information about logged in user.",
            notes = "Return information about the user that is invoking this methid.",
            response = User.class)
    User getInfoAboutMe();

	@GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get user by ID.",
            notes = "Retrieve a user for a given identifier.",
            response = User.class)
    User findByID(@PathParam("id") String id);

	@GET
    @Path("/by/email/{email}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get user by email.",
            notes = "Retrieve a user for a given email address.",
            response = User.class)
    User findByEmail(@PathParam("email") String email);

	@GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get user list.",
            notes = "Retrieve a list of users.",
            response = User.class)
//	@PreAuthorize(Role.HAS_ROLE_USER + " and " 
//            + "hasPermission(#itemId, '" + Target.DEVICE_TYPE 
//            + "', '" + Operation.DELETE + "')")
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
	List<User> listUsers();

	public static class AuthToken {
		/**
		 * third-party OAuth network,
		 * e.g., "github", "google", "facebook"
		 */
		@JsonProperty
		public String network;
		@JsonProperty
		public String username;
		@JsonProperty
		public String token;
	}

	public class GetAuthTokenRequest {
		/**
		 * third-party OAuth network,
		 * e.g., "github", "google", "facebook"
		 */
		@JsonProperty
		public String network;
		@JsonProperty
		public String username;
		@JsonProperty
		public String password;
	}

    @GET
    @Path("/login")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Login and receive an authentication token.",
            notes = "Authenticate via username/password at some third-party "
            		+ "OAuth provider, e.g., facebook, google, or github. "
            		+ "No passwords are ever stored at the platform.",
            response = AuthToken.class)
    public AuthToken login(GetAuthTokenRequest r);

    @GET
    @Path("/count")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get number of users.",
            notes = "Retrieve the number of users registered in the system.",
            response = AuthToken.class)
    long getNumUsers();

}
