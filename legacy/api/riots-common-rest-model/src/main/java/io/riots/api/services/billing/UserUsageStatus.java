package io.riots.api.services.billing;

import java.util.LinkedList;
import java.util.List;

/**
 * Usage status (e.g., amount of API calls made, 
 * percentage of the limit) for a given user.
 * @author whummer
 */
public class UserUsageStatus {

	/**
	 * User ID.
	 */
	private String userId;
	/**
	 * Pricing plan of this user.
	 */
	private PricingPlan plan;
	/**
	 * Limits associated with this pricing plan.
	 */
	private List<UserActionLimitStatus> limitStatuses = 
			new LinkedList<UserActionLimitStatus>();

	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public List<UserActionLimitStatus> getLimitStatuses() {
		return limitStatuses;
	}
	public PricingPlan getPlan() {
		return plan;
	}
	public void setPlan(PricingPlan plan) {
		this.plan = plan;
	}

}
