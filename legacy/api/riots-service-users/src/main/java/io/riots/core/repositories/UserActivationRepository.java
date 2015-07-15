package io.riots.core.repositories;

import io.riots.api.services.users.UserActivation;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author Waldemar Hummer
 */
public interface UserActivationRepository extends PagingAndSortingRepository<UserActivation,String> {

	List<UserActivation> findByUserId(String userId);

	List<UserActivation> findByActivationKey(String activationKey);

}
