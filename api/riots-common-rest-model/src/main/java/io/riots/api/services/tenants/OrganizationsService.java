package io.riots.api.services.tenants;

import io.riots.api.services.users.Permission;
import io.riots.api.services.users.Role;

import java.util.List;

import javax.ws.rs.Consumes;
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
 * Service for managing organizations in the systems.
 * @author whummer
 */
@Service
@Path("/organizations")
@Api(value = "Users", description = "Service for managing organizations in the systems.")
public interface OrganizationsService {

	@GET
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Return all organizations.",
            notes = "Return a list of all organizations registered in the system.",
            response = Organization.class)
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
    List<Organization> getAllOrganizations();

	@GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get organization details.",
            notes = "Return details about the organization with the given ID.",
            response = Organization.class)
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
    Organization getOrganization(@PathParam("id") String id);

	@GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get a user's organizations.",
            notes = "Return a list of organizations of the given user.",
            response = Organization.class)
	@PreAuthorize(Role.HAS_ROLE_USER)
    List<Organization> getOrganizationsOfUser();

	@GET
    @Path("/default")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get a user's default organization.",
            notes = "Return the default organizations of the given user.",
            response = Organization.class)
	@PreAuthorize(Role.HAS_ROLE_USER)
    Organization getDefaultOrganizationOfUser();

	@POST
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Create organization.",
            notes = "Create a new organization.",
            response = Organization.class)
	@PreAuthorize(Role.HAS_ROLE_USER)
	Organization addOrganization(Organization organization);

	@PUT
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Update organization.",
            notes = "Update the given organization.",
            response = Organization.class)
	@PreAuthorize(Role.HAS_ROLE_USER + " and " + Permission.CAN_UPDATE_ORGANIZATION)
	Organization saveOrganization(Organization organization);

	/* METHODS FOR INVITATIONS */

	@PUT
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Save an invitation.",
            notes = "Save a new invitation, e.g., to invite a user to join an organization.",
            response = Organization.class)
	@PreAuthorize(Role.HAS_ROLE_USER)
	Invitation saveInvitation(Invitation invitation);

}
