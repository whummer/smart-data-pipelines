package io.riots.api.services.users;

import java.util.HashSet;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Class which holds authentication information.
 */
public class AuthInfo extends AuthInfoExternal {

	@JsonIgnore
	long lastActiveTime;
	@JsonIgnore
	boolean internalCall;
	@JsonIgnore
	final Set<String> roles = new HashSet<String>();
	@JsonIgnore
	final Set<GrantedAuthority> rolesAsGrantedAuthorities = new HashSet<GrantedAuthority>();

	public AuthInfo() {
	}

	public AuthInfo(AuthInfoExternal ext) {
		copyFrom(ext);
	}

	public void addRole(String role) {
		roles.add(role);
		rolesAsGrantedAuthorities.add(new SimpleGrantedAuthority(role));
	}

	public void addRoles(String... roles) {
		for (String role : roles)
			addRole(role);
	}

	public long getLastActiveTime() {
		return lastActiveTime;
	}

	public void setActiveNow() {
		lastActiveTime = System.currentTimeMillis();
	}

	public boolean isInternalCall() {
		return internalCall;
	}

	public void setInternalCall(boolean internalCall) {
		this.internalCall = internalCall;
	}

	public Set<String> getRoles() {
		return roles;
	}

	public boolean isAdmin() {
		return hasRole(Role.ROLE_ADMIN);
	}

	public boolean hasRole(String role) {
		return roles.contains(role);
	}

	public Set<GrantedAuthority> getRolesAsGrantedAuthorities() {
		return rolesAsGrantedAuthorities;
	}

	@Override
	public String toString() {
		return "AuthInfo [network=" + getNetwork() + ", internalCall="
				+ internalCall + ", userID=" + getUserID() + ", userName="
				+ getName() + ", email=" + getEmail() + ", roles=" + roles
				+ ", accessToken=" + getAccessToken() + ", expiry="
				+ getExpiry() + ", rolesAsGrantedAuthorities="
				+ getRolesAsGrantedAuthorities() + "]";
	}

}