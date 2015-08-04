package io.riots.api.model;

import io.riots.api.services.users.User;
import io.riots.api.services.users.UserPassword;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Subclass of {@link User} with MongoDB specific annotations.
 * @author whummer
 */
@Document
public class UserPasswordMongo extends UserPassword {

	public UserPasswordMongo() {}
	public UserPasswordMongo(UserPassword other) {
		super.copyFrom(other);
	}
	public UserPasswordMongo(String userId, String password) {
		super(userId, password);
	}

	@Indexed(unique = true)
	@Override
	public String getUserId() {
		return super.getUserId();
	}

}
