package io.riots.api.services.users;

import static org.mockito.Mockito.when;
import io.riots.boot.starters.UsersServiceTestStarter;
import io.riots.core.auth.AuthFilterBase;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.auth.AuthNetwork;
import io.riots.core.auth.PasswordUtils;
import io.riots.core.clients.ServiceClientFactory;
import io.riots.core.util.mail.EmailSender;

import java.util.Date;
import java.util.List;

import javax.mail.Message;

import org.apache.commons.lang.StringUtils;
import org.apache.cxf.helpers.IOUtils;
import org.apache.cxf.jaxrs.client.WebClient;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.embedded.EmbeddedServletContainerFactory;
import org.springframework.boot.context.embedded.EmbeddedWebApplicationContext;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.boot.test.WebIntegrationTest;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;

import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.DiscoveryClient;
import com.netflix.discovery.shared.Application;

/**
 * @author whummer
 */
@SpringApplicationConfiguration(classes = {UsersServiceTestStarter.class})
@EnableDiscoveryClient
@WebIntegrationTest("server.port:0")
public class TestUserSignup extends AbstractTestNGSpringContextTests {

	static final Logger LOG = Logger.getLogger(TestUserSignup.class);

	private static final String TEST_USER_EMPTY = "";
	private static final String TEST_PASS_INVALID = "pass"; // too short
	private static final String TEST_PASS_VALID = "pass123";
	private static final String TEST_EMAIL_USER_1 = "test@riots.io";
	private static final String TEST_EMAIL_INVALID = "test@riots"; // invalid email
	private static final String TEST_ADMIN_1 = AuthFilterBase.ADMIN_USER_1;

	@Value("${local.server.port}")
	int port;

	@Autowired
	private EmbeddedWebApplicationContext context;

	@Autowired
	private ServiceClientFactory clientFactory;

	@Autowired
	private DiscoveryClient discoveryClient;

	private UsersService users;

    @Autowired
    private ServiceClientFactory serviceClientFactory;

    @Bean
    public ServiceClientFactory getFactory() {
    	return new ServiceClientFactory();
    }

    @Bean
    public EmbeddedServletContainerFactory getContainerFactory() {
    	return new TomcatEmbeddedServletContainerFactory();
    }

    static {
        String prop = "eureka.client.serviceUrl.defaultZone";
        if (System.getProperty(prop) == null) {
            System.setProperty(prop, "http://localhost:10000/eureka/");
        }
    }

    @BeforeClass
    public void setup() {

        /* setup discovery client */
		InstanceInfo.Builder builder = InstanceInfo.Builder.newBuilder();
        Application usersService = new Application(ServiceClientFactory.SERVICE_USERS_EUREKA_NAME);
		usersService.addInstance(builder
						.setHostName("localhost")
						.setIPAddr("127.0.0.1")
						.setPort(port)
						.setAppName(ServiceClientFactory.SERVICE_USERS_EUREKA_NAME)
						.build()
		);
		when(discoveryClient.getApplication(
				ServiceClientFactory.SERVICE_USERS_EUREKA_NAME)).thenReturn(usersService);

        /* delete existing user */
        users = serviceClientFactory.getUsersServiceClient();
		setTestUserHeader(TEST_ADMIN_1);
        users.deleteUser(TEST_EMAIL_USER_1);

    }

    @org.testng.annotations.Test
    public void testSignup() throws Exception {

        /* empty request, see it fail */
		setTestUserHeader(TEST_USER_EMPTY);
		RequestSignupUser req = new RequestSignupUser();
		testSignUpInvalid(req);
		/* set firstname, see it fail. */
		req.setFirstname("firstname");
		testSignUpInvalid(req);
		/* set lastname, see it fail. */
		req.setLastname("lastname");
		testSignUpInvalid(req);
		/* set invalid password, see it fail. */
		req.setEmail(TEST_EMAIL_USER_1);
		req.password = TEST_PASS_INVALID;
		testSignUpInvalid(req);
		/* set invalid email, see it fail. */
		req.setEmail(TEST_EMAIL_INVALID);
		req.password = TEST_PASS_VALID;
		testSignUpInvalid(req);

		/* clean up test mail account inbox */
		EmailSender.deleteEmailsForTestAccount(false);

		/* set valid email, see it succeed. */
		Date beforeSignup = new Date();
		req.setEmail(TEST_EMAIL_USER_1);
		req.password = TEST_PASS_VALID;
		User u = users.signup(req);
		Assert.assertNotNull(u);
		Assert.assertNotNull(u.getId());

		/* get activation message */
		Message actMsg = null;
		for(int i = 0; i < 3; i ++) {
			List<Message> msgs = EmailSender.getEmailsForTestAccount(true);
			for(Message m : msgs) {
				if(m.getReceivedDate().after(beforeSignup)) {
					actMsg = msgs.get(msgs.size() - 1);
					break;
				}
			}
			if(actMsg != null) {
				break;
			}
			Thread.sleep(5000);
		}
		Assert.assertNotNull(actMsg, "Unable to receive activation email.");

		/* get activation key */
		String msg = IOUtils.readStringFromStream(actMsg.getInputStream());
		String actKeyPattern = "(?s).+" + EmailSender.URL_ACTIVATION.replace("<activationKey>", "([^\\n]+)") + ".+";
		String actKey = msg.replaceAll(actKeyPattern, "$1").trim();
		System.out.println("--> activation key " + actKey);

		/* activate account */
		boolean result = users.activate(new RequestActivateAccount(actKey));
		Assert.assertTrue(result);

		/* perform login */
		AuthInfoExternal info = users.login(new RequestGetAuthToken(
				TEST_EMAIL_USER_1, PasswordUtils.createHash(TEST_PASS_VALID)));
		Assert.assertNotNull(info);
		Assert.assertEquals(info.getEmail(), TEST_EMAIL_USER_1);
		Assert.assertEquals(info.getNetwork(), AuthNetwork.RIOTS);
		Assert.assertFalse(StringUtils.isEmpty(info.getId()));
		Assert.assertFalse(StringUtils.isEmpty(info.getUserID()));

    }

    private void testSignUpInvalid(RequestSignupUser req) {
    	boolean denied = false;
    	try {
        	users.signup(req);
		} catch (Exception e) {
        	denied = true;
		}
    	if(!denied) {
    		throw new RuntimeException("Expected error.");
    	}
    }

	private void setTestUserHeader(String user) {
        AuthHeaders.THREAD_AUTH_INFO.get().get().setEmail(user);
        WebClient.client(users).header(AuthHeaders.HEADER_AUTH_EMAIL, user);
	}
}
