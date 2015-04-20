package io.riots.core.util.mail;

import io.riots.api.services.tenants.Invitation;
import io.riots.api.services.tenants.Organization;
import io.riots.api.services.users.User;

import java.io.IOException;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.util.Properties;

import javax.mail.Flags.Flag;
import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Store;

import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.Email;
import org.apache.commons.mail.SimpleEmail;
import org.apache.cxf.helpers.IOUtils;

/**
 * Class with basic email messaging functionality.
 * 
 * @author whummer
 */
public class EmailSender {

	private static final String 	EMAIL_FROM = "info@riots.io";
	private static final String 	EMAIL_IMAP_HOST = "mail.gandi.net";

	private static final String 	EMAIL_TEST_IMAP_USER = "test@riots.io";
	private static final String 	EMAIL_TEST_IMAP_PASS = "__TODO__";

	private static final String 	EMAIL_PROXY_SMTP_HOST = "smtp.sendgrid.net";
	private static final int 		EMAIL_PROXY_SMTP_PORT = 2525;
	private static final String 	EMAIL_PROXY_SMTP_USER = "whummer";
	private static final String 	EMAIL_PROXY_SMTP_PASS = "__TODO__";

//	private static final String 	EMAIL_SMTP_HOST = "mail.gandi.net";
//	private static final int 		EMAIL_SMTP_PORT = 465;
//	private static final String 	EMAIL_SMTP_USER = "info@riots.io";
//	private static final String 	EMAIL_SMTP_PASS = "__TODO__";

	private static final String 	EMAIL_SMTP_HOST = EMAIL_PROXY_SMTP_HOST;
	private static final int 		EMAIL_SMTP_PORT = EMAIL_PROXY_SMTP_PORT;
	private static final String 	EMAIL_SMTP_USER = EMAIL_PROXY_SMTP_USER;
	private static final String 	EMAIL_SMTP_PASS = EMAIL_PROXY_SMTP_PASS;

	public static final String 	URL_BASE = "http://platform.riots.io:8080";
	public static final String 	URL_ACTIVATION = URL_BASE
			+ "/#/activate/<activationKey>";
	private static final String URL_ACCEPT_INVITATION = URL_BASE
			+ "/#/accept/<invitationKey>";
	private static final String URL_REJECT_INVITATION = URL_BASE
			+ "/#/reject/<invitationKey>";

	// TODO make configurable in config file
	private static final String EMAIL_ACTIVATION_SUBJECT = "riots.io - Account Activation";
	private static final String EMAIL_ACTIVATION_MSG = "Dear <name>,\n"
			+ "\n"
			+ "Please follow this link to activate your account:\n"
			+ URL_ACTIVATION
			+ "\n"
			+ "\n"
			+ "Note: If you did not sign up with riots.io, you can simply ignore this message.";
	// TODO make configurable in config file
	private static final String EMAIL_INVITATION_SUBJECT = "riots.io - Invitation to Join an Organization";
	private static final String EMAIL_INVITATION_MSG = "Dear <invitee>,\n"
			+ "\n"
			+ "You have been invited to join the following organization on riots.io:\n"
			+ "<invitedFor>\n" + "\n"
			+ "To accept this invitation, follow this link:\n"
			+ URL_ACCEPT_INVITATION + "\n" + "\n"
			+ "To reject, follow this link:\n" + URL_REJECT_INVITATION;
	// TODO make configurable in config file
	private static final String EMAIL_ACCOUNT_ACTIVATED_MSG = "Dear <name>,\n"
			+ "\n"
			+ "Your account on http://riots.io has been activated! You can now login with your user account.\n";

	public static void sendActivationMessage(User u, String activationKey) {
		String msg = EMAIL_ACTIVATION_MSG.replace("<name>",
				u.getDisplayName("user")).replace("<activationKey>",
				activationKey);
		send(u.getEmail(), EMAIL_ACTIVATION_SUBJECT, msg);
	}

	public static void sendInvitationMail(User user, User invitee,
			Invitation invitation, Organization org) {
		String msg = EMAIL_INVITATION_MSG
				.replace("<invitee>", invitee.getDisplayName("user"))
				.replace("<invitedFor>", org.getName())
				.replace("<invitationKey>", invitation.getId());
		send(invitee.getEmail(), EMAIL_INVITATION_SUBJECT, msg);
	}

	public static void sendAccountActivatedMessage(User user) {
		String msg = EMAIL_ACCOUNT_ACTIVATED_MSG.replace("<name>",
				user.getDisplayName("user"));
		send(user.getEmail(), EMAIL_ACTIVATION_SUBJECT, msg);
	}

	public static void send(String to, String subject, String message) {
		send(to, subject, message, EMAIL_FROM, EMAIL_SMTP_USER, EMAIL_SMTP_PASS, 
				EMAIL_SMTP_HOST, EMAIL_SMTP_PORT);
	}

	public static void send(String to, String subject, String message, String host, int port) {
		send(to, subject, message, EMAIL_FROM, EMAIL_SMTP_USER, EMAIL_SMTP_PASS, host, port);
	}

	public static void send(String to, String subject, String message,
			String from, String user, String pass, String host, int port) {
		try {
			Email email = new SimpleEmail();
			email.setHostName(host);
			email.setSmtpPort(port);
			email.setSSLOnConnect(true);
			email.setAuthenticator(new DefaultAuthenticator(user, pass));

			email.setFrom(from);
			email.setSubject(subject);
			email.setMsg(message);
			email.addTo(to);
			email.send();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public static List<Message> getEmailsForTestAccount(boolean onlyUnread) throws MessagingException, IOException {
		return getEmailsIMAP(EMAIL_IMAP_HOST, EMAIL_TEST_IMAP_USER, EMAIL_TEST_IMAP_PASS, onlyUnread);
	}

	public static List<Message> getEmailsIMAP(String host, String user, String pass, boolean onlyUnread) 
			throws MessagingException, IOException {
		Folder f = getFolderInboxIMAP(host, user, pass);
		List<Message> result = new LinkedList<>();
		for(Message m : f.getMessages()) {
			if(!onlyUnread || !m.isSet(Flag.SEEN)) {
				result.add(m);
			}
		}
		sortByDateAsc(result);
		return result;
	}

	private static void sortByDateAsc(List<Message> result) {
		result.sort(new Comparator<Message>() {
			public int compare(Message o1, Message o2) {
				try {
					return o1.getReceivedDate().compareTo(o2.getReceivedDate());
				} catch (MessagingException e) {
					return 0;
				}
			}
		});
	}

	private static Folder getFolderInboxIMAP(String host, String user, String pass) 
			throws MessagingException, IOException {
		Store store = getStoreIMAP(host, user, pass);
		Folder root = store.getDefaultFolder();
		Folder f = root.list()[0];
		f = root.getFolder("INBOX");
		f.open(Folder.READ_WRITE);
		return f;
	}

	private static Store getStoreIMAP(String host, String user, String pass) 
			throws MessagingException, IOException {
		Properties props = System.getProperties();
		props.setProperty("mail.store.protocol", "imaps");
		Session session = Session.getDefaultInstance(props, null);
		Store store = session.getStore("imaps");
		store.connect(host, user, pass);
		return store;
	}

	public static List<Message> deleteEmailsForTestAccount(boolean onlyUnread) 
			throws MessagingException, IOException {
		return deleteEmails(EMAIL_IMAP_HOST, EMAIL_TEST_IMAP_USER, EMAIL_TEST_IMAP_PASS, onlyUnread);
	}

	public static List<Message> deleteEmails(String host, String user, String pass, boolean onlyUnread) 
			throws MessagingException, IOException {
		Folder f = getFolderInboxIMAP(host, user, pass);
		List<Message> result = new LinkedList<>();
		for(Message m : f.getMessages()) {
			if(!onlyUnread || !m.isSet(Flag.SEEN)) {
				m.setFlag(Flag.DELETED, true);
				result.add(m);
			}
		}
		f.close(true); // forces delete operations
		return result;
	}

//	public static void main(String[] args) throws Exception {
//		//sendActivationMessage(new User("hummer@dsg.tuwien.ac.at"), "key123");
//		List<Message> msg1 = getEmailsForTestAccount(true);
//		List<Message> msg2 = getEmailsForTestAccount(false);
//		System.out.println(msg1);
//		System.out.println(msg2);
//		if(!msg2.isEmpty()) {
//			Message msg = msg2.get(0);
//			System.out.println(msg.getReceivedDate());
//			System.out.println(Arrays.asList(msg.getFrom()));
//			System.out.println(IOUtils.readStringFromStream(msg.getInputStream()));
//		}
//	}
}
