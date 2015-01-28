package io.riots.core.util.mail;

import io.riots.api.services.tenants.Invitation;
import io.riots.api.services.tenants.Organization;
import io.riots.api.services.users.User;

import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.Email;
import org.apache.commons.mail.SimpleEmail;

/**
 * Class with basic email messaging functionality.
 * @author whummer
 */
public class EmailSender {

	public static final String EMAIL_FROM = "info@riots.io";
	public static final String EMAIL_USER = "info@riots.io";
	public static final String EMAIL_PASS = "__TODO__";
	public static final String EMAIL_SMTP_HOST = "mail.gandi.net";
	public static final int EMAIL_SMTP_PORT = 465;

	public static final String URL_BASE = "http://platform.riots.io:8080";
	public static final String URL_ACTIVATION = URL_BASE + "/#/activate/<activationKey>";
	private static final String URL_ACCEPT_INVITATION = URL_BASE + "/#/accept/<invitationKey>";
	private static final String URL_REJECT_INVITATION = URL_BASE + "/#/reject/<invitationKey>";

	// TODO make configurable in config file
	private static final String EMAIL_ACTIVATION_MSG = "Dear <name>,\n"
			+ "\n"
			+ "Please follow this link to activate your account:\n"
			+ URL_ACTIVATION + "\n"
			+ "\n"
			+ "Note: If you did not sign up with riots.io, you can simply ignore this message.";
	// TODO make configurable in config file
	private static final String EMAIL_INVITATION_MSG = "Dear <invitee>,\n"
			+ "\n"
			+ "You have been invited to join the following organization on riots.io:\n"
			+ "<invitedFor>\n"
			+ "\n"
			+ "To accept this invitation, follow this link:\n"
			+ URL_ACCEPT_INVITATION + "\n"
			+ "\n"
			+ "To reject, follow this link:\n"
			+ URL_REJECT_INVITATION;
	private static final String EMAIL_ACTIVATION_SUBJECT = "riots.io - Account Activation";
	private static final String EMAIL_INVITATION_SUBJECT = "riots.io - Invitation to Join an Organization";

	public static void sendActivationMessage(User u, String activationKey) {
		String msg = EMAIL_ACTIVATION_MSG.
				replace("<name>", u.getDisplayName("user")).
				replace("<activationKey>", activationKey);
		send(u.getEmail(), EMAIL_ACTIVATION_SUBJECT, msg);
	}

	public static void sendInvitationMail(User user, User invitee,
			Invitation invitation, Organization org) {
		String msg = EMAIL_INVITATION_MSG.
				replace("<invitee>", invitee.getDisplayName("user")).
				replace("<invitedFor>", org.getName()).
				replace("<invitationKey>", invitation.getId());
		send(invitee.getEmail(), EMAIL_INVITATION_SUBJECT, msg);
	}

	public static void send(String to, String subject, String message) {
		try {
			Email email = new SimpleEmail();
			email.setHostName(EMAIL_SMTP_HOST);
			email.setSmtpPort(EMAIL_SMTP_PORT);
			email.setSSLOnConnect(true);
			email.setAuthenticator(new DefaultAuthenticator(EMAIL_USER, EMAIL_PASS));

			email.setFrom(EMAIL_FROM);
			email.setSubject(subject);
			email.setMsg(message);
			email.addTo(to);
			email.send();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

}
