package io.riots.api.services.billing;

import java.util.LinkedList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.riots.api.services.model.interfaces.ObjectIdentifiable;
import io.riots.api.services.model.interfaces.ObjectNamed;
import io.riots.api.services.users.UserActionType;

/**
 * Represents pricing plans.
 * @author whummer
 */
public class PricingPlan implements ObjectIdentifiable, ObjectNamed {

	/**
	 * Identifier for DB storage.
	 */
	@JsonProperty
	private String id;
	/** 
	 * Unique name (human-readable identifier) of the pricing plan.
	 */
	@JsonProperty
	private String name;
	/** 
	 * Descriptive display name of the pricing plan.
	 */
	@JsonProperty
	private String displayName;
	/** 
	 * Whether this pricing plan is deactivated
	 * and cannot be chosen by users anymore 
	 * (e.g., is outdated or similar).
	 */
	@JsonProperty
	private boolean deactivated;
	/** 
	 * Fee.
	 */
	private Fee fee = new Fee();
	/**
	 * Limits associated with this pricing plan.
	 */
	private List<UserActionLimit> limits = new LinkedList<UserActionLimit>();

	public PricingPlan() {}
	public PricingPlan(String name, String displayName, double monthlyFee) {
		this.name = name;
		this.displayName = displayName;
		this.fee.fee = monthlyFee;
	}

	public void addLimit(UserActionType type, Object limit, TimePeriod time) {
		this.limits.add(new UserActionLimit(type, limit, time));
	}

	@Override
	public String getId() {
		return id;
	}
	public String getName() {
		return name;
	}
	public List<UserActionLimit> getLimits() {
		return limits;
	}
	public Fee getFee() {
		return fee;
	}
	public boolean isDeactivated() {
		return deactivated;
	}

}
