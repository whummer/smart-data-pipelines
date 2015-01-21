package io.riots.core.repositories;

import io.riots.api.services.billing.PricingPlanAssignment;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface PricingPlanAssignmentRepository extends PagingAndSortingRepository<PricingPlanAssignment,String> {

	PricingPlanAssignment findByUserId(String userId);

}
