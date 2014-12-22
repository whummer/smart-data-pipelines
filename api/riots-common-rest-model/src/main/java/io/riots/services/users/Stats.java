package io.riots.services.users;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Container class for various statistics about the system.
 * @author hummer
 */
public class Stats {

	@JsonProperty
	long numDeviceTypes;
	@JsonProperty
	long numDeviceTypeProperties;
	@JsonProperty
	long numUsers;
	@JsonProperty
	long numUsersOnline;
	@JsonProperty
	long numDevices;
	@JsonProperty
	long numDataPoints;
	@JsonProperty
	long numDevProperties;

	public long getNumDeviceTypes() {
		return numDeviceTypes;
	}
	public void setNumDeviceTypes(long numDeviceTypes) {
		this.numDeviceTypes = numDeviceTypes;
	}
	public long getNumDeviceTypeProperties() {
		return numDeviceTypeProperties;
	}
	public void setNumDeviceTypeProperties(long numDeviceTypeProperties) {
		this.numDeviceTypeProperties = numDeviceTypeProperties;
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
	public long getNumDevices() {
		return numDevices;
	}
	public void setNumDevices(long numDevices) {
		this.numDevices = numDevices;
	}
	public long getNumDataPoints() {
		return numDataPoints;
	}
	public void setNumDataPoints(long numDataPoints) {
		this.numDataPoints = numDataPoints;
	}
	public long getNumDevProperties() {
		return numDevProperties;
	}
	public void setNumDevProperties(long numDevProperties) {
		this.numDevProperties = numDevProperties;
	}
	
}
