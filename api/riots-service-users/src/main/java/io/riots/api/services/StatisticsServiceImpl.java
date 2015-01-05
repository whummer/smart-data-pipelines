package io.riots.api.services;

import javax.servlet.http.HttpServletRequest;

import io.riots.core.auth.AuthHeaders;
import io.riots.core.service.ServiceClientFactory;
import io.riots.services.CatalogService;
import io.riots.services.GatewayStatsService;
import io.riots.services.GatewayStatsService.GatewayStats;
import io.riots.services.StatisticsService;
import io.riots.services.ThingDataService;
import io.riots.services.ThingsService;
import io.riots.services.UsersService;
import io.riots.services.users.Stats;
import io.riots.services.users.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;

/**
 * @author whummer
 */
@Service
public class StatisticsServiceImpl implements StatisticsService {

	@Autowired
	ServiceClientFactory serviceClientFactory;
	@Autowired
	AuthHeaders authHeaders;
	@Autowired
	HttpServletRequest req;

	@Override
    @Timed @ExceptionMetered
    public Stats retrieveStatistics() {
		UsersService users = serviceClientFactory.getUsersServiceClient();
		GatewayStatsService gateway = serviceClientFactory.getGatewayStatsServiceClient();
		CatalogService catalog = serviceClientFactory.getCatalogServiceClient();
		ThingsService things = serviceClientFactory.getThingsServiceClient();
		ThingDataService thingData = serviceClientFactory.getThingDataServiceClient();

		Stats stats = new Stats();
		stats.setNumUsers(users.getNumUsers());
		GatewayStats gwstats = gateway.retrieveStatistics();
		stats.setNumUsersOnline(gwstats.getUsers().getOnline());
		/* set total numbers */
		stats.getTotal().setNumThingTypes(catalog.countThingTypes());
		stats.getTotal().setNumThings(things.countThings());
		stats.getTotal().setNumDataPoints(thingData.countDataItems());
		/* set user-specific numbers */
		User user = authHeaders.getRequestingUser(req);
		if(user != null) {
			stats.getForUser().setUserId(user.getId());
			stats.getForUser().setNumThingTypes(catalog.countThingTypesForUser(user.getId()));
			stats.getForUser().setNumThings(things.countThingsForUser(user.getId()));
			stats.getForUser().setNumDataPoints(thingData.countDataItemsForUser(user.getId()));
		}

		return stats;
	}

}
