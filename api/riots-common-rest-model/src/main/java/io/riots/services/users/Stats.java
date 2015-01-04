package io.riots.services.users;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Container class for various statistics about the system.
 * @author whummer
 */
public class Stats {

	@JsonProperty
	long numThingTypes;
	@JsonProperty
	long numThingTypeProperties;
	@JsonProperty
	long numUsers;
	@JsonProperty
	long numUsersOnline;
	@JsonProperty
	long numThings;
	@JsonProperty
	long numDataPoints;

	public long getNumDeviceTypes() {
		return numThingTypes;
	}
	public void setNumThingTypes(long num) {
		this.numThingTypes = num;
	}
	public long getNumThingTypeProperties() {
		return numThingTypeProperties;
	}
	public void setNumThingTypeProperties(long num) {
		this.numThingTypeProperties = num;
	}
	public long getNumUsers() {
		return numUsers;
	}
	public void setNumUsers(long numUsers) {
		this.numUsers = numUsers;
	}
	public long getNumUsersOnline() {
		return numUsersOnline;
	}
	public void setNumUsersOnline(long numUsersOnline) {
		this.numUsersOnline = numUsersOnline;
	}
	public long getNumThings() {
		return numThings;
	}
	public void setNumThings(long num) {
		this.numThings = num;
	}
	public long getNumDataPoints() {
		return numDataPoints;
	}
	public void setNumDataPoints(long num) {
		this.numDataPoints = num;
	}
	
}
