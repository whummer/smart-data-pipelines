package com.viotualize.services.catalog;

import com.viotualize.core.boot.MongoEnabledServiceStarter;
import org.springframework.boot.SpringApplication;

import com.viotualize.core.boot.ServiceStarter;

/**
 * @author omoser
 * @author riox
 */

public class CatalogServiceStarter extends MongoEnabledServiceStarter {
	
	public static void main(String[] args) {
		SpringApplication.run(CatalogServiceStarter.class, args);
	}

}
