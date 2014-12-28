package io.riots.services.catalog;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * @author riox
 */
@EnableDiscoveryClient
@EnableCircuitBreaker
public class ImageServiceStarter {

	public static void main(String[] args) {
		new SpringApplicationBuilder(ImageServiceStarter.class).run(args);
	}

}
