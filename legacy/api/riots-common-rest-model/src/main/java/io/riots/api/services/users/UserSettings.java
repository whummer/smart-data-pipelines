package io.riots.api.services.users;

import io.riots.api.services.model.interfaces.ObjectIdentifiable;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents a user's configurations.
 * 
 * @author whummer
 */
public class UserSettings implements ObjectIdentifiable {

	/**
	 * Identifier of this settings entity.
	 */
	String id;
	/**
	 * User ID.
	 */
	@JsonProperty
	String userId;
	/**
	 * List of generic properties.
	 */
	@JsonProperty
	Map<String,Object> settings = new HashMap<>();
	/**
	 * List of dashboard element configurations.
	 */
	@JsonProperty
	List<DashboardElement> dashboardElements = new LinkedList<>();

	public static class DashboardElement {
		@JsonProperty
		String position;
		@JsonProperty
		String widgetType;
	}

	public Map<String, Object> getSettings() {
		return settings;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
}
