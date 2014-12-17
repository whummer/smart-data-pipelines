package io.riots.core.repositories;

import io.riots.core.model.User;

import java.util.List;

import org.springframework.stereotype.Repository;

/**
 * @author Waldemar Hummer
 */
public interface UserRepository extends BaseObjectRepository<User> {

	List<User> findByEmail(String email);

}
