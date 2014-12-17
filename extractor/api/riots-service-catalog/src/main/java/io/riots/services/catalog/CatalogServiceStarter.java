package io.riots.services.catalog;

import io.riots.core.auth.AuthFilter;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * @author omoser
 * @author riox
 */
@EnableDiscoveryClient
@EnableCircuitBreaker
public class CatalogServiceStarter extends ElasticSearchEnabledServiceStarter {
	
	public static void main(String[] args) {
		AuthFilter.TESTING_DISABLE_AUTH = true;

        new SpringApplicationBuilder(CatalogServiceStarter.class).web(true).run(args);
	}

}
