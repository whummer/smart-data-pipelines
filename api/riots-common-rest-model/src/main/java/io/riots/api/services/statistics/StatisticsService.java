package io.riots.api.services.statistics;

import io.riots.api.services.users.PlatformStateStats;
import io.riots.api.services.users.UsageStats;
import io.riots.api.services.users.UsageStats.UsagePeriod;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * Service interface for statistics clients.
 * @author whummer
 */
@Service
@Path("/stats")
@Api(value = "Statistics", description = "Retrieve statistics about the system.")
public interface StatisticsService {

	@GET
	@Path("/platform")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve system state info",
		notes = "Retrieve 'static' info about the platform, e.g., "
				+ "number of things stored in the database.", response = PlatformStateStats.class)
	PlatformStateStats retrieveSystemState();

	@GET
	@Path("/usage")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve usage statistics",
		notes = "Retrieve 'dynamic' info about the system, e.g., "
				+ "data transfer usage for the previous months.", response = UsageStats.class)
	UsageStats retrieveUsageStats(
			@QueryParam("from") long from, 
			@QueryParam("to") long to, 
			@QueryParam("period") UsagePeriod period);

}
