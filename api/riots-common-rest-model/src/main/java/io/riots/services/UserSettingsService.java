package io.riots.services;

import io.riots.services.users.UserSettings;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * Interface for users service.
 * @author whummer
 */
@Service
@Api(value = "UserSettings", description = "Service for managing user-specific settings.")
public interface UserSettingsService {

	@GET
    @Path("/by/email/{email}/config")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get configuration for a user email.",
            notes = "Retrieve personalized configuration values for a given user email.",
            response = UserSettings.class)
	UserSettings getConfigForUserEmail(@PathParam("email") String email);

	@PUT
    @Path("/by/email/{email}/config")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Store configuration for a user email.",
            notes = "Store personalized configuration values for a given user, identified by email.",
            response = UserSettings.class)
    UserSettings setConfigForUserEmail(@PathParam("email") String email, UserSettings settings);

}
