package io.riots.api.services.users;

import io.riots.api.services.model.Constants;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request object for querying user actions.
 * @author whummer
 */
public class RequestGetUserActions {

	@JsonProperty(Constants.START_TIME)
	long startTime;
	@JsonProperty(Constants.END_TIME)
	long endTime;
	@JsonProperty(Constants.USER_ID)
	String userId;
	@JsonProperty
	String actionType;
	@JsonProperty
	String httpPath;
	@JsonProperty
	long sizeFrom;
	@JsonProperty
	long sizeTo;

	public long getStartTime() {
		return startTime;
	}
	public long getEndTime() {
		return endTime;
	}
	public String getUserId() {
		return userId;
	}
	public String getActionType() {
		return actionType;
	}
	public String getHttpPath() {
		return httpPath;
	}
	public long getSizeFrom() {
		return sizeFrom;
	}
	public long getSizeTo() {
		return sizeTo;
	}
}
