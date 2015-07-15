package io.riots.api.services.billing;

import io.riots.api.services.users.Role;

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
 * Interface for internal billing service.
 * @author whummer
 */
@Service
@Path("/billing")
@Api(value = "Billing", description = "Service for managing internal billing.")
public interface BillingService {

	@GET
    @Path("/plans")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get pricing plans.",
            notes = "Return a list of available pricing plans, "
            		+ "and the limits associated with the plans.",
            response = PricingPlan.class)
	@PreAuthorize(Role.HAS_ROLE_USER)
    List<PricingPlan> getPlans();

	@POST
    @Path("/plans")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Save pricing plan.",
            notes = "Save a pricing plan.",
            response = PricingPlan.class)
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
    PricingPlan saveBillingPlan(PricingPlan plan);

	@GET
    @Path("/plans/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get pricing plan.",
            notes = "Return a specific pricing plan by identifier.",
            response = PricingPlan.class)
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
    PricingPlan getPlanById(@PathParam("id") String id);

	@PUT
    @Path("/plans/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Update a pricing plan.",
            notes = "Update a specific pricing plan.")
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
    boolean savePlan(@PathParam("id") String id, PricingPlan plan);

	@DELETE
    @Path("/plans/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Delete a pricing plan.",
            notes = "Delete a specific pricing plan.")
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
    boolean deletePlan(@PathParam("id") String id);

	/* BILLING PLAN TO USER ASSIGNMENT */

	@GET
    @Path("/plans/by/user/{userId}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get a user's pricing plan.",
            notes = "Return the pricing plan assigned to a specific user.",
            response = PricingPlan.class)
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
    PricingPlan getPlanForUser(@PathParam("userId") String id);

	@PUT
    @Path("/plans/by/user/{userId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Set a user's pricing plan.",
            notes = "Assign a pricing plan to a specific user.",
            response = PricingPlan.class)
	@PreAuthorize(Role.HAS_ROLE_ADMIN)
    PricingPlan assignPlanForUser(@PathParam("userId") String userId, 
    		PricingPlanAssignment plan);

}
