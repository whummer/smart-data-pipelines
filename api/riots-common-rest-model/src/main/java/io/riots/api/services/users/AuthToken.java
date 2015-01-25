package io.riots.api.services.users;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Authentication token.
 * @author whummer
 */
public class AuthToken {

	/**
	 * Database identifier, for internal use. Not serialized into JSON.
	 */
	@JsonIgnore
	public String id;
	/**
	 * Either "riots", or a third-party OAuth network,
	 * e.g., "github", "google", "facebook"
	 */
	@JsonProperty
	public String network;
	/**
	 * Username which identifies the user of this token.
	 */
	@JsonProperty
	public String username;
	/**
	 * Unique Token string.
	 */
	@JsonProperty
	public String token;
	/**
	 * Expiry date, timestamp encoded in Unix time (milliseconds since 1970-01-01).
	 */
	@JsonProperty
	public long expiry;

}
