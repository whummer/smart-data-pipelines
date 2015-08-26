package io.riots.api.services.users;

import io.riots.api.services.billing.UserUsageStatus;

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

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * Interface for users clients.
 * @author whummer
 */
@Service
@Path("/users")
@Api(value = "Users", description = "Service for managing users in the systems.")
public interface UsersService {

    public static final String DEFAULT_BILLING_PLAN = "trial";

	@GET
    @Path("/me")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Return information about logged in user.",
            notes = "Return information about the user that is invoking this method.",
            response = User.class)
	@PreAuthorize(Role.HAS_ROLE_USER)
    User getInfoAboutMe();

	@PUT
    @Path("/me")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Update profile of the logged in user.",
            notes = "Update the profile information of the currently logged in who is invoking this method.",
            response = User.class)
	@PreAuthorize(Role.HAS_ROLE_USER + " and " + Permission.CAN_UPDATE_USER)
    User saveInfoAboutMe(User user);

	@GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get user by ID.",
            notes = "Retrieve a user for a given identifier.",
            response = User.class)
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
    User findByID(@PathParam("id") String id);

	@GET
    @Path("/by/email/{email}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get user by email.",
            notes = "Retrieve a user for a given email address.",
            response = User.class)
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
    User findByEmail(@PathParam("email") String email);

	@DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Delete a given user.",
            notes = "Delete the user with the given id or email.")
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
	boolean deleteUser(@PathParam("id") String id);

	@GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get user list.",
            notes = "Retrieve a list of users.",
            response = User.class)
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
	List<User> listUsers();

    /* METHODS FOR AUTH TOKENS */

    @POST
    @Path("/signup")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Sign up a new user.",
            notes = "Create a new user account corresponding to the payload information.",
            response = User.class)
    public User signup(RequestSignupUser r);

    @POST
    @Path("/activate")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Activate a user account.",
            notes = "Receives an activation key and activates a user account.")
    public boolean activate(RequestActivateAccount r);

    @POST
    @Path("/login")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Login and receive an authentication token.",
            notes = "Authenticate via username/password at some third-party "
            		+ "OAuth provider, e.g., facebook, google, or github. "
            		+ "No passwords are ever stored at the platform.",
            response = AuthInfoExternal.class)
    public AuthInfoExternal login(RequestGetAuthToken r);

    @POST
    @Path("/auth")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Verify an authentication token.",
            notes = "Verifies the provided authentication token.",
            response = AuthToken.class)
    public AuthInfoExternal getInfoForAuthToken(AuthToken r);

    /**
     * Whether a user account is active or not.
     */
    public static class UserActiveStatus {
    	/** User ID. */
    	public String userId;
    	/** Active status. */
    	public boolean active;
    	/** Status text. */
    	public String status;

    	public UserActiveStatus() {}
    	public UserActiveStatus(String userId, boolean active) {
    		this.userId = userId;
    		this.active = active;
    	}
    }

    @GET
    @Path("/active/{userId}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get user's active status.",
            notes = "Get status of user account (active/inactive).")
    @PreAuthorize(Role.HAS_ROLE_ADMIN)
    public UserActiveStatus getActiveStatus(@PathParam("userId") String userId);

    @POST
    @Path("/active/{userId}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Set user's active status.",
            notes = "Set status of user account (active/inactive).")
    @PreAuthorize(Role.HAS_ROLE_ADMIN)
    public UserActiveStatus setActiveStatus(@PathParam("userId") String userId, UserActiveStatus status);

    /* USER ACTION METHODS */

    @POST
    @Path("/actions/query")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get historical user actions.",
            notes = "Retrieve a list of actions performed by the users in the past.",
            response = UserAction.class)
    @PreAuthorize(Role.HAS_ROLE_ADMIN)
    List<UserAction> getUserActions(RequestGetUserActions req);

    @POST
    @Path("/actions")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Save a user action.",
            notes = "Post and persist a single user action.")
    @PreAuthorize(Role.HAS_ROLE_ADMIN)
    void postUserAction(UserAction action);

    /* USER ACCOUNT USAGE STATUS */

    @GET
    @Path("/{userId}/usage")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get usage status.",
            notes = "Retrieve the current usage status of a user with the given ID.",
            response = AuthToken.class)
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
    UserUsageStatus getUsageStatus(@PathParam("userId") String userId);

    @GET
    @Path("/me/usage")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get usage status.",
            notes = "Retrieve the current usage status of the invoking user, 'me'.",
            response = AuthToken.class)
	@PreAuthorize(Role.HAS_ROLE_USER)
    UserUsageStatus getUsageStatusForThisUser();

}