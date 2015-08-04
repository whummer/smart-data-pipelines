package io.riots.core.repositories;

import io.riots.api.services.users.UserSettings;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author Waldemar Hummer
 */
public interface UserSettingsRepository extends PagingAndSortingRepository<UserSettings,String> {

	List<UserSettings> findByUserId(String userId);

}
