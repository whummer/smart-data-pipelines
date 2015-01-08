package io.riots.services.files;

import io.riots.core.boot.ServiceStarter;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Server starter for the FilesService
 * @author riox
 */
@EnableDiscoveryClient
@EnableCircuitBreaker
public class FilesServiceStarter extends ServiceStarter {

	public static void main(String[] args) {		
		if(System.getProperty("RIOTS_LOG_DIR") == null) {
			System.setProperty("RIOTS_LOG_DIR", "log");
		}
		new SpringApplicationBuilder(FilesServiceStarter.class).run(args);
	}

}
