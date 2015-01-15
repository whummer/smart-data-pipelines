package io.riots.api.services;

import io.riots.core.auth.AuthFilterBase;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.service.ServiceClientFactory;
import io.riots.services.UsersService;

import java.io.IOException;

import org.apache.cxf.jaxrs.client.WebClient;
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
@ContextConfiguration(classes = {TestUserPermissions.class})
@ComponentScan(basePackages = {"org.springframework.cloud.netflix.eureka"})
@Configuration
@EnableDiscoveryClient
@EnableAutoConfiguration
@EnableConfigurationProperties
public class TestUserPermissions {

    static final Logger LOG = Logger.getLogger(TestUserPermissions.class);

	private static final String TEST_USER_1 = "test1@riots.io";
	private static final String TEST_ADMIN_1 = AuthFilterBase.ADMIN_USER_1;

    private static UsersService users;

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
            users = serviceClientFactory.getUsersServiceClient();
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

	private void listUsers() {

		/* permitted */
		setTestUserHeader(TEST_ADMIN_1);
        users.listUsers();

		/* not permitted */
		setTestUserHeader(TEST_USER_1);
        boolean isDenied = false;
        try {
            users.listUsers();
		} catch (Exception e) {
			isDenied = true;
		}
        if(!isDenied) {
			throw new RuntimeException("Expected 403 (permission denied).");
        }

	}

	private void setTestUserHeader(String user) {
        AuthHeaders.THREAD_AUTH_INFO.get().get().setEmail(user);
        WebClient.client(users).header(AuthHeaders.HEADER_AUTH_EMAIL, user);
	}
}
