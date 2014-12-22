package io.riots.api.services;

import io.riots.core.service.IStatistics;
import io.riots.core.service.IUsers;
import io.riots.core.service.ServiceClientFactory;
import io.riots.services.users.Stats;

import javax.ws.rs.Path;

import org.springframework.stereotype.Service;

/**
 * @author whummer
 */
@Service
@Path("/stats")
public class Statistics implements IStatistics {

	@Override
	public Stats retrieveStatistics() {
		Stats stats = new Stats();
		IUsers users = ServiceClientFactory.getUsersServiceClient();
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
