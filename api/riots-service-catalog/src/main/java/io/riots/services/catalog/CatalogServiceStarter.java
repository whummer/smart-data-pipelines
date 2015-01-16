package io.riots.services.catalog;

import io.riots.core.boot.ServiceStarter;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * @author omoser
 * @author riox
 */
@EnableDiscoveryClient
@EnableCircuitBreaker
// todo @EnableMetrics clashes with @Context MessageContext injection in the service impl classes
//@EnableMetrics(proxyTargetClass = true, exposeProxy = true)
public class CatalogServiceStarter extends ElasticSearchEnabledServiceStarter {
	
	public static void main(String[] args) {
		ServiceStarter.setDefaultSystemProps();
        new SpringApplicationBuilder(CatalogServiceStarter.class).web(true).run(args);
	}

}
