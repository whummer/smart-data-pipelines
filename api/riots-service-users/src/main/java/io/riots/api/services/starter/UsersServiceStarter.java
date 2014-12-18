package io.riots.api.services.starter;

import io.riots.core.auth.AuthFilter;
import io.riots.core.boot.MongoEnabledServiceStarter;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * @author whummer
 */
@EnableDiscoveryClient
@EnableCircuitBreaker
public class UsersServiceStarter extends MongoEnabledServiceStarter {
    public static void main(String[] args) {
		AuthFilter.DISABLE_AUTH = true;
        if (System.getProperty("RIOTS_LOG_DIR") == null) {
            System.setProperty("RIOTS_LOG_DIR", "log");
        }
        new SpringApplicationBuilder(UsersServiceStarter.class).web(true).run(args);
        //SpringApplication.run(UsersServiceStarter.class, args);
    }
}
