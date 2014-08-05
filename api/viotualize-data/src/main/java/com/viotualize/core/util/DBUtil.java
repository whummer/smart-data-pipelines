package com.viotualize.core.util;

import java.util.UUID;

public class DBUtil {

	public static String genUUID() {
		return UUID.randomUUID().toString();
	}
	public static String genShortUID() {
		return UUID.randomUUID().toString().substring(0, 8);
	}
	public static String genMediumUID() {
		String uuid = UUID.randomUUID().toString();
		return uuid.substring(uuid.length() - 12);
	}

}
