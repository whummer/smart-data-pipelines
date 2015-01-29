package io.riots.api.services.model;

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

	@Indexed(unique = true)
	public String getAccessToken() {
		return super.getAccessToken();
	}

}
