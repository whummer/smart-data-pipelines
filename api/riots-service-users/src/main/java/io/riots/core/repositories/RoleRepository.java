package io.riots.core.repositories;

import org.springframework.data.repository.PagingAndSortingRepository;

import io.riots.api.services.users.Role;
import org.springframework.stereotype.Component;

/**
 * @author Waldemar Hummer
 */
public interface RoleRepository extends PagingAndSortingRepository<Role, String> {
}
