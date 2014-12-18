package io.riots.api.services;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import io.riots.api.handlers.query.UserQuery;
import io.riots.core.model.User;
import io.riots.core.service.IUsers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for managing users in the systems.
 * 
 * @author whummer
 */
@Service
@Path("/users")
public class Users implements IUsers {

    @Autowired
    UserQuery userQuery;

//	@GET
//    @Path("/{id}")
//    @Produces(MediaType.APPLICATION_JSON)
    public User findByID(/*@PathParam("id")*/ String id) {
    	User u = userQuery.findById(id);
    	return u;
    }

//	@GET
//    @Path("/by/email/{email}")
//    @Produces(MediaType.APPLICATION_JSON)
    public User findByEmail(/*@PathParam("email") */ String email) {
    	User r = userQuery.findOrCreateByEmail(email);
    	return r;
    }

//    @GET
//    @Path("/login")
//    @Produces(MediaType.APPLICATION_JSON)
//    @Consumes(MediaType.APPLICATION_JSON)
    public AuthToken login(GetAuthTokenRequest r) {
    	AuthToken response = new AuthToken();
    	response.network = r.network;
    	return response;
    }

}
