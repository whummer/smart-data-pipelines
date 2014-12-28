package io.riots.api.services;

import java.util.List;

import io.riots.core.repositories.UserSettingsRepository;
import io.riots.core.service.UserSettingsService;
import io.riots.core.service.ServiceClientFactory;
import io.riots.services.users.User;
import io.riots.services.users.UserSettings;

import javax.ws.rs.Path;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for managing users in the systems.
 * 
 * @author whummer
 */
@Service
@Path("/users")
public class UserSettingsServiceImpl implements UserSettingsService {

	private static final Logger LOG = Logger.getLogger(UserSettingsServiceImpl.class);

    @Autowired
    UserSettingsRepository settingsRepo;
	@Autowired
	ServiceClientFactory serviceClientFactory;


	@Override
	public UserSettings getConfigForUserEmail(String email) {
		User user = serviceClientFactory.getUsersServiceClient().findByEmail(email);
		List<UserSettings> list = settingsRepo.findByUserId(user.getId());
		if(list.isEmpty()) {
			UserSettings s = new UserSettings();
			s = settingsRepo.save(s);
			s.setUserId(user.getId());
			return s;
		}
		if(list.size() > 1) {
			LOG.warn("Multiple user configuration entities found for email/userId: " + email + "/" + user.getId());
		}
		return list.get(0);
	}

	@Override
	public UserSettings setConfigForUserEmail(String email, UserSettings settings) {
		UserSettings existing = getConfigForUserEmail(email);
		settings.setId(existing.getId());
		settings.setUserId(existing.getUserId());
		settings = settingsRepo.save(settings);
		return settings;
	}

}
