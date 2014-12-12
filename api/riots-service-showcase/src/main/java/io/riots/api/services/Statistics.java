package io.riots.api.services;

import io.riots.api.services.auth.AuthFilter;
import io.riots.core.repositories.DeviceRepository;
import io.riots.core.repositories.DeviceTypeRepository;
import io.riots.core.repositories.PropertyRepository;
import io.riots.core.repositories.UserRepository;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * @author whummer
 */
@Service
@Path("/stats")
@Api(value = "Statistics", description = "Various statistics and metadata about the state of the platform.")
public class Statistics {

	@Autowired
	UserRepository userRepo;
	@Autowired
	DeviceRepository devRepo;
	@Autowired
	DeviceTypeRepository devTypeRepo;
	@Autowired
	PropertyRepository devPropsRepo;

	public static class Stats {
		@JsonProperty
		long numDeviceTypes;
		@JsonProperty
		long numDeviceTypeProperties;
		@JsonProperty
		long numUsers;
		@JsonProperty
		long numUsersOnline;
		@JsonProperty
		long numDevices;
		@JsonProperty
		long numDataPoints;
		@JsonProperty
		long numDevProperties;
	}

	@GET
	@Path("/")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve statistics", notes = "Retrieve statistics", response = Stats.class)
	@Timed
	@ExceptionMetered
	public Response retrieve() {
		Stats stats = new Stats();
		stats.numUsers = userRepo.count();
		stats.numUsersOnline = AuthFilter.getOnlineUsersCount();
		stats.numDeviceTypes = devTypeRepo.count();
		stats.numDeviceTypeProperties = devPropsRepo.count();
		stats.numDevices = devRepo.count();
		stats.numDataPoints = 0; // TODO
		return Response.ok(stats).build();
	}

}
