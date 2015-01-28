package io.riots.core.repositories;

import io.riots.api.services.tenants.Organization;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface OrganizationRepository extends PagingAndSortingRepository<Organization,String> {

	List<Organization> findByCreatorIdOrMembers(String userId1, String userId2);

}
