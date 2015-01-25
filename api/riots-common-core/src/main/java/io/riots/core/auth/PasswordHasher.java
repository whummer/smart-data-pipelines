package io.riots.core.auth;

import org.apache.commons.codec.digest.DigestUtils;

/**
 * Utilities for hashing secret information like passwords,
 * which should not be saved as plaintext in the DB.
 * @author hummer
 */
public class PasswordHasher {

	public static String createHash(String data) {
		return DigestUtils.sha256Hex(data);
	}

}
