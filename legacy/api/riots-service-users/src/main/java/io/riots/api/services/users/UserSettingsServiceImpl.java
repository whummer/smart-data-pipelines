package io.riots.api.services.users;

import io.riots.core.repositories.UserSettingsRepository;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.clients.ServiceClientFactory;

import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;

/**
 * Service for managing users in the systems.
 * 
 * @author whummer
 */
@Service
public class UserSettingsServiceImpl implements UserSettingsService {

	private static final Logger LOG = Logger.getLogger(UserSettingsServiceImpl.class);

    @Autowired
    UserSettingsRepository settingsRepo;
	@Autowired
	ServiceClientFactory serviceClientFactory;


	@Override
	@Timed @ExceptionMetered
	public UserSettings getConfigForUserEmail(String email) {
		UsersService users = serviceClientFactory.getUsersServiceClient(AuthHeaders.INTERNAL_CALL);
		User user = users.findByEmail(email);
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
	@Timed @ExceptionMetered
    public UserSettings setConfigForUserEmail(String email, UserSettings settings) {
		UserSettings existing = getConfigForUserEmail(email);
		settings.setId(existing.getId());
		settings.setUserId(existing.getUserId());
		settings = settingsRepo.save(settings);
		return settings;
	}

}
