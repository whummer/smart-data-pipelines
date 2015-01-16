package io.riots.api.services;

import io.riots.core.auth.AuthFilterBase;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.service.ServiceClientFactory;
import io.riots.core.test.TestUtils;
import io.riots.services.ApplicationsService;
import io.riots.services.UsersService;
import io.riots.services.apps.Application;
import io.riots.services.users.User;

import java.io.IOException;
import java.util.List;

import org.apache.log4j.Logger;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author whummer
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {TestGatewayModifyInternalHeader.class})
@ComponentScan(basePackages = {"org.springframework.cloud.netflix.eureka"})
@Configuration
@EnableDiscoveryClient
@EnableAutoConfiguration
@EnableConfigurationProperties
public class TestGatewayModifyInternalHeader {

    static final Logger LOG = Logger.getLogger(TestGatewayModifyInternalHeader.class);

	private static final String TEST_USER_1 = "test1@riots.io";
	private static final String TEST_ADMIN_1 = AuthFilterBase.ADMIN_USER_1;

    private static UsersService users;
    private static UsersService usersInternal;
    private static ApplicationsService apps;
    private static ApplicationsService appsInternal;

    @Autowired
    ServiceClientFactory serviceClientFactory;

    @Bean
    public ServiceClientFactory getFactory() {
    	return new ServiceClientFactory();
    }

    static {
        String prop = "eureka.client.serviceUrl.defaultZone";
        if (System.getProperty(prop) == null) {
            System.setProperty(prop, "http://localhost:10000/eureka/");
        }
    }

    @Before
    public void setup() {
        try {
        	String url = serviceClientFactory.getServiceUrlForName(
        			ServiceClientFactory.SERVICE_USERS_EUREKA_NAME);
        	url = url.replaceAll(":[0-9]+", ":8080");
            users = serviceClientFactory.getServiceInstanceForURL(url, UsersService.class);
            apps = serviceClientFactory.getServiceInstanceForURL(url, ApplicationsService.class);
            usersInternal = serviceClientFactory.getUsersServiceClient(AuthHeaders.INTERNAL_CALL);
            appsInternal = serviceClientFactory.getApplicationsServiceClient(AuthHeaders.INTERNAL_CALL);
        } catch (Exception e) {
            e.printStackTrace();
            /* services not running, do not run this test class */
        }
    }

    @Test
    public void testPermissions() throws IOException {
        if (users == null) {
            LOG.info("Services not available, skipping test. Not inserting data.");
            return;
        }
        listUsers();
    }

    private String getAppKey() {
		/* get applications */
        List<Application> list = appsInternal.list();
		/* add application if necessary */
        if(list.isEmpty()) {
        	appsInternal.create(new Application("testApp1"));
        	list = appsInternal.list();
        }
        return list.get(0).getAppKey();
    }

    private User getUser(String email) {
        return usersInternal.findByEmail(email);
    }

	private void listUsers() {

		/* permitted */
		User user1 = getUser(TEST_ADMIN_1);
		setTestUserHeader(user1.getEmail(), user1.getId());
		String appKey1 = getAppKey();
        TestUtils.setTestHeader(users, AuthHeaders.HEADER_AUTH_APP_KEY, appKey1);
        users.listUsers();

		/* not permitted */
		User user2 = getUser(TEST_USER_1);
        setTestUserHeader(user2.getEmail(), user2.getId());
		String appKey2 = getAppKey();
        TestUtils.setTestHeader(users, AuthHeaders.HEADER_AUTH_APP_KEY, appKey2);
        TestUtils.setTestHeader(users, AuthHeaders.HEADER_INTERNAL_CALL, "true");
        boolean isDenied = false;
        try {
            users.listUsers();
		} catch (Exception e) {
			isDenied = true;
		}
        if(!isDenied) {
			throw new RuntimeException("Expected 403, but permission was actually granted.");
        }

	}

	private void setTestUserHeader(String email, String id) {
        TestUtils.setTestUserEmailHeader(users, email);
        TestUtils.setTestHeader(users, AuthHeaders.HEADER_AUTH_USER_ID, id);
        TestUtils.setTestUserEmailHeader(apps, email);
        TestUtils.setTestHeader(apps, AuthHeaders.HEADER_AUTH_USER_ID, id);
        TestUtils.setTestUserEmailHeader(appsInternal, email);
        TestUtils.setTestHeader(appsInternal, AuthHeaders.HEADER_AUTH_USER_ID, id);
	}
}
