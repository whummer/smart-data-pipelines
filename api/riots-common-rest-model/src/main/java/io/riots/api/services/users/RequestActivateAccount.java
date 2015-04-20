package io.riots.api.services.users;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request object for activating a user account.
 * @author whummer
 */
public class RequestActivateAccount {

	/**
	 * Activation key.
	 */
	@JsonProperty
	public String activationKey;

	public RequestActivateAccount() {}
	public RequestActivateAccount(String activationKey) {
		this.activationKey = activationKey;
	}

}
