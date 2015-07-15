package io.riots.core.repositories;

import io.riots.api.services.billing.PricingPlan;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface PricingPlanRepository extends PagingAndSortingRepository<PricingPlan,String> {
}
