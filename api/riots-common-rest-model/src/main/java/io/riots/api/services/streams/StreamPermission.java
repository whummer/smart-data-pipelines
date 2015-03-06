package io.riots.api.services.streams;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.riots.api.services.model.interfaces.ObjectIdentifiable;

/**
 * Models permissions on data streams.
 */
public class StreamPermission implements ObjectIdentifiable {

	public static enum PermissionStatus {
		REQUESTED, GRANTED, DENIED
	}

	/**
	 * Identifier.
	 */
	@JsonProperty
	String id;
	/**
	 * Current status of this permission.
	 */
	@JsonProperty
	PermissionStatus status;
	

	public String getId() {
		return id;
	}

}
