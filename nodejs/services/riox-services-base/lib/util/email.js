var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

/* constants */
var EMAIL_FROM = "info@riox.io";
var EMAIL_IMAP_HOST = "mail.gandi.net";
var EMAIL_TEST_IMAP_USER = "test@riox.io";
var EMAIL_TEST_IMAP_PASS = "__TODO__";
var EMAIL_PROXY_SMTP_HOST = "smtp.sendgrid.net";
var EMAIL_PROXY_SMTP_PORT = 2525;
var EMAIL_PROXY_SMTP_USER = "whummer";
var EMAIL_PROXY_SMTP_PASS = "__TODO__";
var URL_BASE = "http://platform.riox.io:8081";
var URL_ACTIVATION = URL_BASE + "/#/activate/<activationKey>";
var URL_ACCEPT_INVITATION = URL_BASE + "/#/accept/<invitationKey>";
var URL_REJECT_INVITATION = URL_BASE + "/#/reject/<invitationKey>";
//var EMAIL_SMTP_HOST = "mail.gandi.net";
//var EMAIL_SMTP_PORT = 465;
//var EMAIL_SMTP_USER = "info@riox.io";
//var EMAIL_SMTP_PASS = "__TODO__";
var EMAIL_SMTP_HOST = EMAIL_PROXY_SMTP_HOST;
var EMAIL_SMTP_PORT = EMAIL_PROXY_SMTP_PORT;
var EMAIL_SMTP_USER = EMAIL_PROXY_SMTP_USER;
var EMAIL_SMTP_PASS = EMAIL_PROXY_SMTP_PASS;


// TODO make configurable in config file
var EMAIL_ACTIVATION_SUBJECT = "riox.io - Account Activation";
var EMAIL_ACTIVATION_MSG = "Dear <name>,\n"
		+ "\n"
		+ "Please follow this link to activate your account:\n"
		+ URL_ACTIVATION
		+ "\n"
		+ "\n"
		+ "Note: If you did not sign up with riox.io, you can simply ignore this message.";
// TODO make configurable in config file
var EMAIL_INVITATION_SUBJECT = "riox.io - Invitation to Join an Organization";
var EMAIL_INVITATION_MSG = "Dear <invitee>,\n"
		+ "\n"
		+ "You have been invited to join the following organization on riox.io:\n"
		+ "<invitedFor>\n" + "\n"
		+ "To accept this invitation, follow this link:\n"
		+ URL_ACCEPT_INVITATION + "\n" + "\n"
		+ "To reject, follow this link:\n" + URL_REJECT_INVITATION;
// TODO make configurable in config file
var EMAIL_ACCOUNT_ACTIVATED_MSG = "Dear <name>,\n"
		+ "\n"
		+ "Your account on http://riox.io has been activated! You can now login with your user account.\n";

exports.sendActivationMail = function(user, activationKey) {
	var displayName = user.firstname + " " + user.lastname;
	var msg = EMAIL_ACTIVATION_MSG.replace("<name>",
			user.name).replace("<activationKey>", activationKey);
	send(user.email, EMAIL_ACTIVATION_SUBJECT, msg);
};

exports.sendInvitationMail = function(user, invitee, invitation, org) {
	var displayName = invitee.name ? invitee.name : (invitee.firstname + " " + invitee.lastname);
	var msg = EMAIL_INVITATION_MSG
			.replace(/<invitee>/g, displayName)
			.replace(/<invitedFor>/g, org[NAME])
			.replace(/<invitationKey>/g, invitation[ID]);
	console.log("sending invitation mail", invitee, msg);
	send(invitee.email, EMAIL_INVITATION_SUBJECT, msg);
};

exports.sendAccountActivatedMail = function(user) {
	var displayName = user.firstname + " " + user.lastname;
	var msg = EMAIL_ACCOUNT_ACTIVATED_MSG.replace("<name>", displayName);
	send(user.email, EMAIL_ACTIVATION_SUBJECT, msg);
};

var send = exports.send = function(to, subject, message, from, user, pass, host, port) {
	if(!from) from = EMAIL_FROM;
	if(!user) user = EMAIL_SMTP_USER;
	if(!pass) pass = EMAIL_SMTP_PASS;
	if(!host) host = EMAIL_SMTP_HOST;
	if(!port) port = EMAIL_SMTP_PORT;

	var transporter = nodemailer.createTransport(smtpTransport({
	    host: host,
	    port: port,
	    auth: {
	        user: user,
	        pass: pass
	    }
	}));

	// send mail
	transporter.sendMail({
	    from: from,
	    to: to,
	    subject: subject,
	    text: message
	});
};
