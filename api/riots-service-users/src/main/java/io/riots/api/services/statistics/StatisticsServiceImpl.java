package io.riots.api.services.statistics;

import io.riots.core.auth.AuthHeaders;
import io.riots.core.clients.ServiceClientFactory;
import io.riots.api.services.catalog.CatalogService;
import io.riots.api.services.statistics.GatewayStatsService;
import io.riots.api.services.statistics.GatewayStatsService.GatewayStats;
import io.riots.api.services.statistics.StatisticsService;
import io.riots.api.services.scenarios.ThingDataService;
import io.riots.api.services.scenarios.ThingsService;
import io.riots.api.services.users.UsersService;
import io.riots.api.services.users.PlatformStateStats;
import io.riots.api.services.users.UsageStats;
import io.riots.api.services.users.UsageStats.Usage;
import io.riots.api.services.users.UsageStats.UsagePeriod;
import io.riots.api.services.users.User;

import java.util.Calendar;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.time.DateUtils;
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
    public PlatformStateStats retrieveSystemState() {
		UsersService users = serviceClientFactory.getUsersServiceClient();
		GatewayStatsService gateway = serviceClientFactory.getGatewayStatsServiceClient();
		CatalogService catalog = serviceClientFactory.getCatalogServiceClient();
		ThingsService things = serviceClientFactory.getThingsServiceClient();
		ThingDataService thingData = serviceClientFactory.getThingDataServiceClient();

		PlatformStateStats stats = new PlatformStateStats();
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
			stats.getForUser().setNumDataPoints(
					thingData.countDataItemsForUser(user.getId(), 0, 0));
		}

		return stats;
	}

	@Override
	public UsageStats retrieveUsageStats(long from, long to, UsagePeriod period) {
		ThingDataService thingData = serviceClientFactory.getThingDataServiceClient();
		User user = authHeaders.getRequestingUser(req);

		if(period == null) {
			period = UsagePeriod.month;
		}
		if(to <= 0) {
			to = System.currentTimeMillis();
		}
		if(from <= 0) {
			from = rollDate(new Date(to), period, -5).getTime();
		}

		UsageStats result = new UsageStats();
		Date d1 = new Date(from);
		if(period == UsagePeriod.month) {
			d1 = DateUtils.truncate(d1, Calendar.MONTH);
		}
		Date d2 = new Date(to);
		int count = 0;
		do {
			Date d3 = rollDate(d1, period, 1);
			Usage u = new Usage();
			u.setFromDate(d1);
			u.setToDate(d3);
			u.setUpdateEvents(thingData.countDataItemsForUser(
					user.getId(), d1.getTime(), d3.getTime()));
			result.getUsage().add(u);
			d1 = d3;
			if(count++ > 20) {
				throw new IllegalArgumentException("Too many data points. Please use smaller time range.");
			}
		} while(d1.before(d2));
		return result;
	}
	
	/* HELPER METHODS */

	private Date rollDate(Date d, UsagePeriod period, int amount) {
		if(period == UsagePeriod.hour) {
			return DateUtils.addHours(d, amount);
		} else if(period == UsagePeriod.day) {
			return DateUtils.addDays(d, amount);
		} else if(period == UsagePeriod.week) {
			return DateUtils.addWeeks(d, amount);
		} else if(period == UsagePeriod.month) {
			return DateUtils.addMonths(d, amount);
		} else if(period == UsagePeriod.year) {
			return DateUtils.addYears(d, amount);
		}
		throw new IllegalArgumentException("Unknown usage period: " + period);
	}
}
