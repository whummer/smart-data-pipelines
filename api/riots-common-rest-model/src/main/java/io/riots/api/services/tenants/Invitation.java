package io.riots.api.services.tenants;

import io.riots.api.services.model.Constants;
import io.riots.api.services.model.interfaces.ObjectCreated;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Class to represent invitations, 
 * e.g., to join an organization.
 * @author whummer
 */
public class Invitation implements ObjectIdentifiable, ObjectCreated {

	public static enum InvitationType {
		JOIN_ORGANIZATION
	}
	public static enum InvitationStatus {
		PENDING,
		CONFIRMED,
		REJECTED
	}

	/**
	 * Identifier.
	 */
	@JsonProperty
	private String id;
	/**
	 * Unique key of this invitation.
	 */
	@JsonIgnore
	private String invitationKey;
	/**
	 * Id of creating user.
	 */
	@JsonProperty(Constants.CREATOR_ID)
	private String creatorId;
	/**
	 * Creation date.
	 */
	@JsonProperty(Constants.CREATION_DATE)
	private Date created;
	/**
	 * The invited party, e.g., user ID or email address of the invited user.
	 */
	private String invitee;
	/**
	 * Target of this invitation, 
	 * e.g., ID of the organization to invite a user to.
	 */
	private String invitedFor;
	/**
	 * Current status of the invitation.
	 */
	private InvitationStatus status = InvitationStatus.PENDING;


	/* GETTTER AND SETTER METHODS */

	public String getId() {
		return id;
	}
	public String getInvitee() {
		return invitee;
	}
	public void setInvitee(String invitee) {
		this.invitee = invitee;
	}
	public InvitationStatus getStatus() {
		return status;
	}
	public void setStatus(InvitationStatus status) {
		this.status = status;
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
	public String getInvitedFor() {
		return invitedFor;
	}
	public void setInvitedFor(String invitedFor) {
		this.invitedFor = invitedFor;
	}
	public String getInvitationKey() {
		return invitationKey;
	}
	public void setInvitationKey(String invitationKey) {
		this.invitationKey = invitationKey;
	}
}
