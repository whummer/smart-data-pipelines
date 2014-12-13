package io.riots.services.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * @author omoser
 * @author riox
 */
@EnableDiscoveryClient
public class CatalogServiceStarter extends ElasticSearchEnabledServiceStarter {
	
	public static void main(String[] args) {
		SpringApplication.run(CatalogServiceStarter.class, args);
	}

}
