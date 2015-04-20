package io.riots.api.services.tenants;

import io.riots.api.services.tenants.Invitation.InvitationStatus;
import io.riots.api.services.users.User;
import io.riots.api.services.users.UsersService;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.clients.ServiceClientFactory;
import io.riots.core.model.ModelCache;
import io.riots.core.repositories.InvitationRepository;
import io.riots.core.repositories.OrganizationRepository;
import io.riots.core.util.ServiceUtil;
import io.riots.core.util.mail.EmailSender;

import java.util.Arrays;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.validator.routines.EmailValidator;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.google.common.collect.Iterables;

/**
 * Service for managing organizations.
 * @author whummer
 */
@Service
public class OrganizationsServiceImpl implements OrganizationsService {

	private static final Logger LOG = Logger.getLogger(OrganizationsServiceImpl.class);

	@Autowired
	OrganizationRepository orgRepo;
	@Autowired
	InvitationRepository invRepo;

    @Autowired
    HttpServletRequest req;
    @Autowired
    AuthHeaders authHeaders;
    @Autowired
    ServiceClientFactory clientFactory;

	@Override
	@Timed @ExceptionMetered
	public List<Organization> getAllOrganizations() {
		Iterable<Organization> list = orgRepo.findAll();
		System.out.println("list");
		for(Organization org : list) {
			System.out.println("--> " + org);
		}
		List<Organization> result = Arrays.asList(Iterables.toArray(list, Organization.class));
		System.out.println("result2 " + result);
		return result;
	}

	@Override
	@Timed @ExceptionMetered
	public Organization getOrganization(String id) {
		Organization result = orgRepo.findOne(id);
		System.out.println("result1 " + result);
		return result;
	}

	@Override
	@Timed @ExceptionMetered
	public Organization getDefaultOrganizationOfUser() {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		Organization result = getOrInsertDefaultOrganization(user);
		System.out.println("result " + result);
		return result;
	}

	@Override
	@Timed @ExceptionMetered
	public List<OrganizationMembership> getOrganizationsOfUser() {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		
		/* make sure we have a default organization */
		getOrInsertDefaultOrganization(user);
		/* construct result */
		UsersService users = clientFactory.getUsersServiceClient(AuthHeaders.INTERNAL_CALL);
		List<OrganizationMembership> result = new LinkedList<OrganizationMembership>();
		List<Organization> list = orgRepo.findByCreatorIdOrMembersOrMembers(
				user.getId(), user.getId(), user.getEmail());
		for(Organization org : list) {
			OrganizationMembership mem = new OrganizationMembership(org);
			List<Invitation> inv = invRepo.findByCreatorIdAndInviteeAndInvitedFor(
					org.getCreatorId(), user.getId(), org.getId());
			if(inv.isEmpty()) {
				mem.setStatus(InvitationStatus.UNKNOWN);
			} else if(inv.size() == 1) {
				mem.setStatus(inv.get(0).getStatus());
			}
			User creator = ModelCache.getUser(org.getCreatorId(), users);
			mem.setCreatorDisplayName(creator.getDisplayName());
			result.add(mem);
		}
		/* find and return organizations */
		return result;
	}

	@Override
	@Timed @ExceptionMetered
	public Organization addOrganization(Organization organization) {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		ServiceUtil.assertIdIsNull(organization);
		organization.setCreatorId(user.getId());
		organization.setCreated(new Date());
		return orgRepo.save(organization);
	}

	@Override
	@Timed @ExceptionMetered
	public Organization saveOrganization(Organization organization) {
		UsersService users = clientFactory.getUsersServiceClient(AuthHeaders.INTERNAL_CALL);
		ServiceUtil.assertIdIsNotNull(organization);
		List<String> invited = new LinkedList<>();
		/* scan list of member IDs */
		for(String member : organization.getMembers()) {
			String id = null;
			try {
				if(EmailValidator.getInstance(false).isValid(member)) {
					id = users.findByEmail(member).getId();
				} else {
					id = users.findByID(member).getId();
				}
				if(id != null) {
					invited.add(id);
				}
			} catch (Exception e) {
				LOG.info("Unable to find organization member specified by the user: " + member);
			}
		}
		/* save invitations */
		for(String id : invited) {
			Invitation inv = new Invitation();
			inv.setInvitee(id);
			inv.setInvitedFor(organization.getId());
			saveInvitation(inv);
		}
		return orgRepo.save(organization);
	}

	/* METHODS FOR INVITATIONS */

	@Override
	@Timed @ExceptionMetered
	public Invitation saveInvitation(Invitation invitation) {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		ServiceUtil.assertIdIsNull(invitation);
		invitation.setCreated(new Date());
		invitation.setCreatorId(user.getId());
		/* check if this invitation already exists */
		List<Invitation> existing = invRepo.findByCreatorIdAndInviteeAndInvitedFor(
				user.getId(), invitation.getInvitee(), invitation.getInvitedFor());
		if(existing.isEmpty()) {
			/* if not, then save */
			invitation.setInvitationKey(UUID.randomUUID().toString());
			invitation.setStatus(InvitationStatus.PENDING);
			invitation = invRepo.save(invitation);
			/* also send out email */
			// TODO client caching
			UsersService users = clientFactory.getUsersServiceClient(AuthHeaders.INTERNAL_CALL);
			User invitee = users.findByID(invitation.getInvitee());
			OrganizationsService orgsService = clientFactory.getOrganizationsServiceClient(AuthHeaders.INTERNAL_CALL);
			Organization org = orgsService.getOrganization(invitation.getInvitedFor());
			EmailSender.sendInvitationMail(user, invitee, invitation, org);
		} else {
			/* otherwise, return existing */
			invitation = existing.get(0);
			if(existing.size() > 1) {
				LOG.warn("Found multiple invitations for invitor '" + 
						invitation.getCreatorId() + "', invitee '" + invitation.getInvitee() + 
						"', invited for '" + invitation.getInvitedFor() + "'");
			}
		}
		return invitation;
	}

	/* PRIVATE HELPER METHODS */

	private Organization getOrInsertDefaultOrganization(User user) {
		List<Organization> list = orgRepo.findByCreatorIdOrMembers(user.getId(), user.getId());
		if(list.isEmpty()) {
			Organization org = new Organization();
			org.setCreated(new Date());
			org.setCreatorId(user.getId());
			org.setName(Organization.DEFAULT_ORGANIZATION_NAME);
			org = orgRepo.save(org);
			return org;
		}
		return list.get(0);
	}

}
