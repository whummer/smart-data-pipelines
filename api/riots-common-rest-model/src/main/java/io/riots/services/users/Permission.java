package io.riots.services.users;

/**
 * Class to represent access control permissions.
 * 
 * @author Waldemar Hummer
 */
public class Permission {

	public static final String CAN_DELETE_THING_ID = 
			"hasPermission(#id, '" + Target.THING + "', '" + Operation.DELETE + "')";
	public static final String CAN_UPDATE_THING = 
			"hasPermission(#thing, '" + Operation.UPDATE + "')";
	public static final String CAN_DELETE_APPLICATION_ID = 
			"hasPermission(#id, '" + Target.APPLICATION + "', '" + Operation.DELETE + "')";
	public static final String CAN_UPDATE_APPLICATION = 
			"hasPermission(#application, '" + Operation.UPDATE + "')";

	public static enum Operation {
		;
		public static final String CREATE = "CREATE";
		public static final String READ = "READ";
		public static final String UPDATE = "UPDATE";
		public static final String DELETE = "DELETE";
	}

	public static enum Target {
		;
		public static final String THING_TYPE = "THING_TYPE";
		public static final String THING = "THING";
		public static final String APPLICATION = "APPLICATION";
	}

}
