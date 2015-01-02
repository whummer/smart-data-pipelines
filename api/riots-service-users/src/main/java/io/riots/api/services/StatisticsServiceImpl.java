package io.riots.api.services;

import io.riots.core.service.ServiceClientFactory;
import io.riots.services.StatisticsService;
import io.riots.services.UsersService;
import io.riots.services.users.Stats;

import javax.ws.rs.Path;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;

/**
 * @author whummer
 */
@Service
@Path("/stats")
public class StatisticsServiceImpl implements StatisticsService {

	@Autowired
	ServiceClientFactory serviceClientFactory;

	@Override
    @Timed @ExceptionMetered
    public Stats retrieveStatistics() {
		Stats stats = new Stats();
		UsersService users = serviceClientFactory.getUsersServiceClient();
		stats.setNumUsers(users.getNumUsers());
		// TODO
//		stats.numUsersOnline = AuthFilter.getOnlineUsersCount();
//		stats.numDeviceTypes = devTypeRepo.count();
//		stats.numDeviceTypeProperties = devPropsRepo.count();
//		stats.numDevices = devRepo.count();
//		stats.numDataPoints = 0; // TODO
		return stats;
	}

}
