package io.riots.core.util.mail;

import io.riots.api.services.users.User;

import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.Email;
import org.apache.commons.mail.SimpleEmail;

public class EmailSender {

	public static final String EMAIL_FROM = "info@riots.io";
	public static final String EMAIL_USER = "info@riots.io";
	public static final String EMAIL_PASS = "__TODO__";
	public static final String EMAIL_SMTP_HOST = "mail.gandi.net";
	public static final int EMAIL_SMTP_PORT = 465;

	public static final String URL_ACTIVATION = "http://platform.riots.io:8080/#/activate/<activationKey>";

	// TODO make configurable in config file
	private static final String EMAIL_ACTIVATION_MSG = "Dear <firstname>,\n"
			+ "\n"
			+ "Please follow this link to activate your account:\n"
			+ URL_ACTIVATION + "\n"
			+ "\n"
			+ "If you did not sign up with riots.io, you can simply ignore this message.";
	private static final String EMAIL_ACTIVATION_SUBJECT = "riots.io - Account Activation";

	public static void sendActivationMessage(User u, String activationKey) {
		String msg = EMAIL_ACTIVATION_MSG.
				replace("<firstname>", u.getFirstname()).
				replace("<activationKey>", activationKey);
		send(u.getEmail(), EMAIL_ACTIVATION_SUBJECT, msg);
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

//	public static void main(String[] args) {
//		send("w@hummer.io", "subject", "message");
//	}
}
