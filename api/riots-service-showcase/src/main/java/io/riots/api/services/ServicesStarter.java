package io.riots.api.services;

import io.riots.core.boot.MongoEnabledServiceStarter;
import org.springframework.boot.SpringApplication;

/**
 * @author omoser
 * @author riox
 */

public class ServicesStarter extends MongoEnabledServiceStarter {
	
	public static void main(String[] args) {
		SpringApplication.run(ServicesStarter.class, args);
	}

}
