package io.riots.api.services.users;

/**
 * Represents an action performed by a user, or an action
 * performed by the riots platform on behalf of a user.
 *
 * @author Waldemar Hummer
 */
public class UserAction {

	private static enum UserActionType {
		LOGIN,
		LOGOUT,

		DATA_IN,
		DATA_OUT,

		API_ACCESS,
		DB_ACCESS;
	}

	/**
	 * Type of the user action.
	 */
	UserActionType type;
	/**
	 * ID of the user who executed the action.
	 */
	String userId;
	/**
	 * Path of the request.
	 */
	String httpPath;
	/**
	 * Time of the action.
	 */
	long timestamp;
	/**
	 * Size of data, incoming.
	 */
	double bytesIn;
	/**
	 * Size of data, outgoing.
	 */
	double bytesOut;

	public UserAction() {}
	public UserAction(String userId, String httpPath, long bytesIn, long bytesOut) {
		this(userId, httpPath, parseType(httpPath), bytesIn, bytesOut);
	}
	public UserAction(String userId, String httpPath, UserActionType type, long bytesIn, long bytesOut) {
		this.timestamp = System.currentTimeMillis();
		this.userId = userId;
		this.type = type;
		this.httpPath = httpPath;
		this.bytesIn = bytesIn >= 0 ? bytesIn : 0;
		this.bytesOut = bytesOut >= 0 ? bytesOut : 0;
	}

	static UserActionType parseType(String httpPath) {
		return UserActionType.API_ACCESS; // TODO
	}

	public UserActionType getType() {
		return type;
	}
	public void setType(UserActionType type) {
		this.type = type;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public long getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}
	public double getBytesIn() {
		return bytesIn;
	}
	public void setBytesIn(double bytesIn) {
		this.bytesIn = bytesIn;
	}
	public double getBytesOut() {
		return bytesOut;
	}
	public void setBytesOut(double bytesOut) {
		this.bytesOut = bytesOut;
	}
	public String getHttpPath() {
		return httpPath;
	}
	public void setHttpPath(String httpPath) {
		this.httpPath = httpPath;
	}

	@Override
	public String toString() {
		return "UserAction [type=" + type + ", userId=" + userId
				+ ", timestamp=" + timestamp + ", bytesIn=" + bytesIn
				+ ", bytesOut=" + bytesOut + "]";
	}

}
