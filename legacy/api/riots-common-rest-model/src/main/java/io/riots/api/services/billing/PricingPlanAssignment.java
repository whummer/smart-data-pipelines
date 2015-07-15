package io.riots.api.services.billing;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.riots.api.services.model.interfaces.ObjectIdentifiable;


/**
 * Assign a pricing plan to a user.
 * @author whummer
 */
public class PricingPlanAssignment implements ObjectIdentifiable {

	/**
	 * ID of this assignment.
	 */
	@JsonProperty
	private String id;
	/**
	 * ID of the affected user.
	 */
	@JsonProperty
	private String userId;
	/**
	 * ID of the pricing plan.
	 */
	@JsonProperty
	private String planId;


	@Override
	public String getId() {
		return id;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getPlanId() {
		return planId;
	}
	public void setPlanId(String planId) {
		this.planId = planId;
	}
	
}
