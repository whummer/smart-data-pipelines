package io.riots.services.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.context.annotation.ImportResource;

/**
 * @author omoser
 * @author riox
 */
public class CatalogServiceStarter extends ElasticSearchEnabledServiceStarter {
	
	public static void main(String[] args) {
		SpringApplication.run(CatalogServiceStarter.class, args);
	}

}
