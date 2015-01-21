package io.riots.core.repositories;

import io.riots.api.services.users.Role;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author Waldemar Hummer
 */
public interface RoleRepository extends PagingAndSortingRepository<Role, String> {
}
