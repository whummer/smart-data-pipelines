package io.riots.api.services;

import io.riots.api.services.applications.ApplicationsService;
import io.riots.api.services.streams.StreamSinkService;
import io.riots.core.clients.ServiceClientFactory;
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
 * Created by omoser on 09/03/15.
 *
 * @author omoser
 */

/*@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {StreamSinkServiceTest.class})
@ComponentScan(basePackages = {"org.springframework.cloud.netflix.eureka"})
@Configuration
@EnableDiscoveryClient
@EnableAutoConfiguration
@EnableConfigurationProperties
public class StreamSinkServiceTest {

	static final Logger LOG = Logger.getLogger(TestApplicationServicePermissions.class);

	private static final String TEST_USER_1 = "test1@riots.io";
	private static final String TEST_USER_2 = "test2@riots.io";

	private static StreamSinkService streamSinkService;

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
			streamSinkService = serviceClientFactory.getApplicationsServiceClient();
		} catch (Exception e) {
			e.printStackTrace();
            *//* services not running, do not run this test class *//*
		}
	}

	@Test
public class StreamSinkServiceTest {

}*/
