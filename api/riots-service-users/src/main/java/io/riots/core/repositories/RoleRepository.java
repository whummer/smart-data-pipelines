package io.riots.core.repositories;

import org.springframework.data.repository.PagingAndSortingRepository;

import io.riots.services.users.Role;

/**
 * @author Waldemar Hummer
 */
public interface RoleRepository extends PagingAndSortingRepository<Role, String> {
}
