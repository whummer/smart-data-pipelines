package io.riots.api.services;

import io.riots.core.service.ServiceClientFactory;
import io.riots.services.CatalogService;
import io.riots.services.GatewayStatsService;
import io.riots.services.GatewayStatsService.GatewayStats;
import io.riots.services.StatisticsService;
import io.riots.services.ThingDataService;
import io.riots.services.ThingsService;
import io.riots.services.UsersService;
import io.riots.services.users.Stats;

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

	@Override
    @Timed @ExceptionMetered
    public Stats retrieveStatistics() {
		Stats stats = new Stats();
		UsersService users = serviceClientFactory.getUsersServiceClient();
		GatewayStatsService gateway = serviceClientFactory.getGatewayStatsServiceClient();
		CatalogService catalog = serviceClientFactory.getCatalogServiceClient();
		ThingsService things = serviceClientFactory.getThingsServiceClient();
		ThingDataService thingData = serviceClientFactory.getThingDataServiceClient();
		stats.setNumUsers(users.getNumUsers());
		GatewayStats gwstats = gateway.retrieveStatistics();
		stats.setNumUsersOnline(gwstats.getUsers().getOnline());
		stats.setNumThingTypes(catalog.countThingTypes());
		System.out.println("num things: " + things.countThings());
		stats.setNumThings(things.countThings());
		System.out.println("num data points: " + thingData.countDataItems());
		stats.setNumDataPoints(thingData.countDataItems());
		return stats;
	}

}
