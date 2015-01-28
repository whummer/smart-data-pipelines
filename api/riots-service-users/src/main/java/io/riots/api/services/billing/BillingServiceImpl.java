package io.riots.api.services.billing;

import io.riots.api.services.billing.BillingService;
import io.riots.api.services.billing.PricingPlan;
import io.riots.api.services.billing.PricingPlanAssignment;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.repositories.PricingPlanAssignmentRepository;
import io.riots.core.repositories.PricingPlanRepository;

import java.util.Arrays;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.google.common.collect.Iterables;

/**
 * Service for billing.
 *
 * @author whummer
 */
@Service
public class BillingServiceImpl implements BillingService {

    @Autowired
    PricingPlanRepository planRepo;
    @Autowired
    PricingPlanAssignmentRepository planAssignmentRepo;

    @Autowired
    HttpServletRequest req;
    @Autowired
    AuthHeaders authHeaders;

    @Override
    @Timed @ExceptionMetered
    public List<PricingPlan> getPlans() {
    	return Arrays.asList(Iterables.toArray(
    			planRepo.findAll(), PricingPlan.class));
    }

    @Override
    @Timed @ExceptionMetered
    public PricingPlan getPlanById(String id) {
    	return planRepo.findOne(id);
    }

    @Override
    @Timed @ExceptionMetered
    public PricingPlan saveBillingPlan(PricingPlan plan) {
    	return planRepo.save(plan);
    }

    @Override
    @Timed @ExceptionMetered
    public boolean savePlan(String id, PricingPlan plan) {
    	if(!id.equals(plan.getId())) {
    		return false;
    	}
    	planRepo.save(plan);
    	return true;
    }

    @Override
    @Timed @ExceptionMetered
    public boolean deletePlan(String id) {
    	planRepo.delete(id);
    	return true;
    }

	/* BILLING PLAN TO USER ASSIGNMENT */

    @Override
    @Timed @ExceptionMetered
    public PricingPlan getPlanForUser(String userId) {
    	PricingPlanAssignment a = getPlanAssignmentForUserId(userId);
    	if(a == null) {
    		return null;
    	}
    	PricingPlan plan = planRepo.findOne(a.getPlanId());
    	return plan;
    }

    @Override
    @Timed @ExceptionMetered
    public PricingPlan assignPlanForUser(String userId, PricingPlanAssignment planAss) {
    	userId = !StringUtils.isEmpty(userId) ? userId : planAss.getUserId();
    	PricingPlanAssignment a = getPlanAssignmentForUserId(planAss.getUserId());
    	if(a == null) {
    		a = planAss;
    	} else {
    		a.setPlanId(planAss.getPlanId());
    		a.setUserId(planAss.getUserId());
    	}
    	a = planAssignmentRepo.save(a);
    	PricingPlan plan = planRepo.findOne(a.getPlanId());
    	return plan;
    }

    /* PRIVATE HELPER METHODS */

    private PricingPlanAssignment getPlanAssignmentForUserId(String userId) {
    	PricingPlanAssignment a = planAssignmentRepo.findByUserId(userId);
    	return a;
    }
}
