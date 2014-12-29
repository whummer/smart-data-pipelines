package io.riots.core.repositories;

import io.riots.services.users.User;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author Waldemar Hummer
 */
public interface UserRepository extends PagingAndSortingRepository<User,String> {

	List<User> findByEmail(String email);

}
