package com.viotualize.catalog;

import org.springframework.boot.SpringApplication;

import com.viotualize.boot.ServiceStarter;

/**
 * @author omoser
 * @author riox
 */
public class CatalogServiceStarter extends ServiceStarter {
	
	public static void main(String[] args) {
		
		SpringApplication.run(CatalogServiceStarter.class, args);
				
	}

}
