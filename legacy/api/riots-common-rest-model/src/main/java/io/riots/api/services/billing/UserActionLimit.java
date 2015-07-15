package io.riots.api.services.billing;

import io.riots.api.services.users.UserActionType;

/**
 * Represents a limit for a given type of user action. Limits
 * are associated with billing plans and need to be enforced
 * within the platform.
 * @author whummer
 */
public class UserActionLimit {

	/**
	 * Type of action.
	 */
	UserActionType type;
	/**
	 * Limit to apply (typically a number, e.g., 
	 * number of requests per time unit).
	 */
	Object limit;
	/**
	 * Time period to apply this limit to.
	 */
	TimePeriod time;

	public UserActionLimit() {}
	public UserActionLimit(UserActionType type, Object limit, TimePeriod time) {
		this.type = type;
		this.limit = limit;
		this.time = time;
	}

	public UserActionType getType() {
		return type;
	}
	public Object getLimit() {
		return limit;
	}
	public TimePeriod getTime() {
		return time;
	}
}
