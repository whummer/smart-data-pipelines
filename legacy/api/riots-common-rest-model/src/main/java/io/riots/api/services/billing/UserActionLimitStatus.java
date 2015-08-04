package io.riots.api.services.billing;

import io.riots.api.services.users.UserActionType;

/**
 * Status of a given user limit, e.g., amount of 
 * API requests already performed by a given user 
 * in the current billing period.
 *
 * @author whummer
 */
public class UserActionLimitStatus {

	/**
	 * User ID.
	 */
	String userId;
	/**
	 * Type of the user action.
	 */
	UserActionType type;
	/**
	 * Status (typically a number, e.g., 
	 * number of API requests made).
	 */
	Object status;
	/**
	 * Limit of this user action, 
	 * corresponding to the user's billing plan.
	 */
	Object limit;
	/**
	 * Percentage of the limit currently used.
	 */
	double percentage;
	/**
	 * Whether to display this info on the UI.
	 */
	boolean display;

	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public UserActionType getType() {
		return type;
	}
	public void setType(UserActionType type) {
		this.type = type;
	}
	public Object getStatus() {
		return status;
	}
	public void setStatus(Object status) {
		this.status = status;
	}
	public Object getLimit() {
		return limit;
	}
	public void setLimit(Object limit) {
		this.limit = limit;
	}
	public double getPercentage() {
		return percentage;
	}
	public void setPercentage(double percentage) {
		this.percentage = percentage;
	}
	public boolean isDisplay() {
		return display;
	}
	public void setDisplay(boolean display) {
		this.display = display;
	}

}
