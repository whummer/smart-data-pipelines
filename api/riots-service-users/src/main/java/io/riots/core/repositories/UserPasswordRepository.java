package io.riots.core.repositories;

import io.riots.api.services.users.UserPassword;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author Waldemar Hummer
 */
public interface UserPasswordRepository extends PagingAndSortingRepository<UserPassword,String> {

	List<UserPassword> findByUserId(String userId);

	List<UserPassword> findByUserIdAndPassword(String userId, String password);

}
