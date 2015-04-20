package io.riots.api.model;

import io.riots.api.services.users.User;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Subclass of {@link User} with MongoDB specific annotations.
 * @author whummer
 */
@Document
public class UserMongo extends User {

	public UserMongo() {}
	public UserMongo(User user) {
		copyFrom(user);
	}

	@Override
	@Indexed(unique = true)
	public String getEmail() {
		return super.getEmail();
	}

}
