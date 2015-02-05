package io.riots.api.model;

import io.riots.api.services.users.AuthInfoExternal;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * MongoDB extension of {@link AuthInfoExternal}. Adds
 * necessary unique constraints, etc.
 * @author whummer
 */
@Document
public class AuthInfoMongo extends AuthInfoExternal {

	public AuthInfoMongo() {}
	public AuthInfoMongo(AuthInfoExternal info) {
		copyFrom(info);
	}

	@Indexed(unique = true)
	public String getAccessToken() {
		return super.getAccessToken();
	}

}
