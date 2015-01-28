package io.riots.api.services.tenants;

import io.riots.api.services.tenants.Invitation.InvitationStatus;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Class to represent a single organization 
 * membership of a user.
 * @author whummer
 */
public class OrganizationMembership extends Organization {

	/**
	 * Name of the creator, as displayed in the UI.
	 */
	@JsonProperty
	private String creatorDisplayName;
	/**
	 * Membership membership status.
	 */
	@JsonProperty
	private InvitationStatus status;

	public OrganizationMembership() {}
	public OrganizationMembership(Organization copyFrom) {
		this.setId(copyFrom.getId());
		this.setCreatorId(copyFrom.getCreatorId());
		this.setCreated(copyFrom.getCreated());
		this.setName(copyFrom.getName());
		this.getMembers().addAll(copyFrom.getMembers());
	}

	public String getCreatorDisplayName() {
		return creatorDisplayName;
	}
	public void setCreatorDisplayName(String creatorDisplayName) {
		this.creatorDisplayName = creatorDisplayName;
	}
	public InvitationStatus getStatus() {
		return status;
	}
	public void setStatus(InvitationStatus status) {
		this.status = status;
	}
}
