package io.riots.api.services.statistics;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;

/**
 * Service interface for gateway statistics.
 * @author whummer
 */
@Service
@Path("/stats")
@Api(value = "GatewayStats", description = "Retrieve statistics about the gateway.")
public interface GatewayStatsService {

	public static class UsersStats {
		@JsonProperty
		long online;

		public long getOnline() {
			return online;
		}
		public void setOnline(long online) {
			this.online = online;
		}
	}

    public static class GatewayStats {
		UsersStats users = new UsersStats();
		public UsersStats getUsers() {
			return users;
		}
	}

	@GET
	@Path("/")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiOperation(value = "Retrieve statistics", 
	notes = "Retrieve statistics", response = GatewayStats.class)
	GatewayStats retrieveStatistics();

}
