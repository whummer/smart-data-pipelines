package io.riots.api.services;

import io.riots.core.auth.AuthHeaders;
import io.riots.core.service.ServiceClientFactory;
import io.riots.services.ThingsService;
import io.riots.services.model.interfaces.ObjectIdentifiable;
import io.riots.services.scenario.Thing;

import java.io.IOException;
import java.util.List;

import org.apache.cxf.jaxrs.client.WebClient;
import org.apache.log4j.Logger;
import org.junit.Assert;
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
@ContextConfiguration(classes = {TestThingPermissions.class})
@ComponentScan(basePackages = {"org.springframework.cloud.netflix.eureka"})
@Configuration
@EnableDiscoveryClient
@EnableAutoConfiguration
@EnableConfigurationProperties
public class TestThingPermissions {

    static final Logger LOG = Logger.getLogger(TestThingPermissions.class);

	private static final String TEST_USER_1 = "test1@riots.io";
	private static final String TEST_USER_2 = "test2@riots.io";

    private static ThingsService things;

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
            things = serviceClientFactory.getThingsServiceClient();
        } catch (Exception e) {
            e.printStackTrace();
            /* services not running, do not run this test class */
        }
    }

    @Test
    public void insertData() throws IOException {
        if (things == null) {
            LOG.info("Services not available, skipping test. Not inserting data.");
            return;
        }
        insertThingAndDeleteWithDifferentUser();
        insertThingAndListWithDifferentUser();
    }

	private void insertThingAndDeleteWithDifferentUser() {

		setTestUserHeader(TEST_USER_1);
        Thing t = new Thing("testThing1");
        t = things.create(t);

        setTestUserHeader(TEST_USER_2);
        boolean isForbidden = false;
        try {
            things.delete(t.getId());
		} catch (Exception e) {
			isForbidden = true;
		}
        if(!isForbidden) {
			throw new RuntimeException("Expected 403 (permission denied).");
        }

        /* clean up */
        setTestUserHeader(TEST_USER_1);
        things.delete(t.getId());

	}

	private void insertThingAndListWithDifferentUser() {

		setTestUserHeader(TEST_USER_1);
        Thing t = new Thing("testThing1");
        t = things.create(t);

        List<Thing> list1 = things.list();
        Assert.assertTrue(contains(list1, t));

        setTestUserHeader(TEST_USER_2);
        List<Thing> list2 = things.list();
        Assert.assertFalse(contains(list2, t));

        /* clean up */
        setTestUserHeader(TEST_USER_1);
        things.delete(t.getId());

	}

	/* HELPER METHODS */
	
	private boolean contains(List<? extends ObjectIdentifiable> list, ObjectIdentifiable item) {
		for(ObjectIdentifiable i : list) {
			if(i.getId().equals(item.getId())) {
				return true;
			}
		}
		return false;
	}

	private void setTestUserHeader(String user) {
        AuthHeaders.THREAD_AUTH_INFO.get().get().setEmail(user);
        WebClient.client(things).reset();
        WebClient.client(things).header(AuthHeaders.HEADER_AUTH_EMAIL, user);
	}
}
