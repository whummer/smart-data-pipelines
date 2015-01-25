package io.riots.core.util.mail;

import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.Email;
import org.apache.commons.mail.SimpleEmail;

public class SendEmail {

	public static final String EMAIL_FROM = "info@riots.io";
	public static final String EMAIL_USER = "info";
	public static final String EMAIL_PASS = "__TODO__";
	public static final String EMAIL_SMTP_HOST = "mail.gandi.net";
	public static final int EMAIL_SMTP_PORT = 465;

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

	public static void main(String[] args) {
		send("w@hummer.io", "subject", "message");
	}
}
