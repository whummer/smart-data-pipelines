package io.riots.core.repositories;

import io.riots.api.model.UserPasswordMongo;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author Waldemar Hummer
 */
public interface UserPasswordRepository extends PagingAndSortingRepository<UserPasswordMongo,String> {

	List<UserPasswordMongo> findByUserId(String userId);

	List<UserPasswordMongo> findByUserIdAndPassword(String userId, String password);

}
