package io.riots.core.repositories;

import io.riots.api.model.UserMongo;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author Waldemar Hummer
 */
public interface UserRepository extends PagingAndSortingRepository<UserMongo,String> {

	List<UserMongo> findByEmail(String email);

}
