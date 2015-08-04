package io.riots.core.auth;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.StringUtils;

/**
 * Utilities for hashing secret information like passwords,
 * which should not be saved as plaintext in the DB.
 * @author hummer
 */
public class PasswordUtils {

	public static String createHash(String password) {
		return DigestUtils.sha256Hex(password);
	}

	/**
	 * Password restrictions:
	 *  - 6 to 50 characters
	 *  - Must contain at least one letter (case insensitive);
	 *  - May contain the following characters: ! @ # $ % & * - _
	 */
	public static boolean isValid(String password) {
		return !StringUtils.isEmpty(password) && 
				password.matches("^((?=.*[a-zA-Z])[a-zA-Z0-9!@#$%&*\\-_]{6,50})$");
	}

}
