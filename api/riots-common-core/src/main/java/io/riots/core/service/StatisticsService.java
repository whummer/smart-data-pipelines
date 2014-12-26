package io.riots.core.service;

import io.riots.services.users.Stats;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * Service interface for statistics service.
 * @author whummer
 */
@Service
@Api(value = "Statistics", description = "Retrieve statistics about the system.")
public interface StatisticsService {

	@GET
	@Path("/")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve statistics", notes = "Retrieve statistics", response = Stats.class)
	@Timed
	@ExceptionMetered
	Stats retrieveStatistics();
}
