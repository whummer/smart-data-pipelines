package io.riots.services.model;

/**
 * Represents an access control permission.
 * 
 * @author Waldemar Hummer
 */
public class Permission {

	public static enum Operation {
		;
		public static final String CREATE = "CREATE";
		public static final String READ = "READ";
		public static final String UPDATE = "UPDATE";
		public static final String DELETE = "DELETE";
	}

	public static enum Target {
		;
		public static final String DEVICE_TYPE = "DEVICE_TYPE";
	}

}
