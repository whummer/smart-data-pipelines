package io.riots.api.services.starter;

import io.riots.core.boot.MongoEnabledServiceStarter;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ImportResource;

/**
 * @author whummer
 */
@EnableDiscoveryClient
@EnableCircuitBreaker
public class UsersServiceStarter extends MongoEnabledServiceStarter {

    public static void main(String[] args) {
		if (System.getProperty("RIOTS_LOG_DIR") == null) {
            System.setProperty("RIOTS_LOG_DIR", "log");
        }

        new SpringApplicationBuilder(UsersServiceStarter.class).web(true).run(args);
    }
}
