package io.riots.api.services.streams;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.riots.api.services.model.Constants;
import io.riots.api.services.model.interfaces.ObjectCreated;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;

/**
 * Models permissions on data streams.
 * @author whummer
 */
public class StreamPermission implements ObjectIdentifiable, ObjectCreated {

	public static enum PermissionStatus {
		REQUESTED, GRANTED, DENIED
	}

	/**
	 * Identifier.
	 */
	@JsonProperty(Constants.ID)
	String id;
	/**
	 * Target stream ID.
	 */
	@JsonProperty(Constants.STREAM_ID)
	String streamId;
	/**
	 * Creation date of this entity.
	 */
	@JsonProperty(Constants.CREATION_DATE)
	Date created;
	/**
	 * Creator (user id) of this permission.
	 */
	@JsonProperty(Constants.CREATOR_ID)
	String creatorId;
	/**
	 * The target user associated with this stream permission
	 * (typically the user who has requested permission).
	 */
	@JsonProperty(Constants.USER_ID)
	String userId;
	/**
	 * The target user associated with this stream permission
	 * (typically the user who has requested permission).
	 */
	@JsonProperty(Constants.ORGANIZATION_ID)
	String organizationId;
	/**
	 * Current status of this permission.
	 */
	@JsonProperty
	PermissionStatus status;


	public String getId() {
		return id;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getStreamId() {
		return streamId;
	}
	public void setStreamId(String streamId) {
		this.streamId = streamId;
	}
	public Date getCreated() {
		return created;
	}
	public void setCreated(Date created) {
		this.created = created;
	}
	public String getCreatorId() {
		return creatorId;
	}
	public void setCreatorId(String creatorId) {
		this.creatorId = creatorId;
	}
	public PermissionStatus getStatus() {
		return status;
	}
	public void setStatus(PermissionStatus status) {
		this.status = status;
	}

}
