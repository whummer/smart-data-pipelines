package io.riots.services.catalog;

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
        new SpringApplicationBuilder(CatalogServiceStarter.class).web(true).run(args);
	}

}
