package io.riots.core.repositories;

import io.riots.api.services.tenants.Invitation;
import io.riots.api.services.tenants.Invitation.InvitationStatus;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface InvitationRepository extends PagingAndSortingRepository<Invitation,String> {

	List<Invitation> findByInvitee(String invitee);

	List<Invitation> findByCreatorIdAndInviteeAndInvitedFor(String creatorId, String invitee, String invitedFor);

	List<Invitation> findByCreatorIdAndInviteeAndInvitedForAndStatus(String creatorId, String invitee, String invitedFor, InvitationStatus status);

}
