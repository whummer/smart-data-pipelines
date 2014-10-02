package io.riots.services.catalog;

import io.riots.core.boot.MongoEnabledServiceStarter;
import org.springframework.boot.SpringApplication;

/**
 * @author omoser
 * @author riox
 */

public class CatalogServiceStarter extends MongoEnabledServiceStarter {
	
	public static void main(String[] args) {
		SpringApplication.run(CatalogServiceStarter.class, args);
	}

}
