package io.riots.api.services.starter;

import io.riots.core.boot.MongoEnabledServiceStarter;
import io.riots.core.boot.ServiceStarter;

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
    	ServiceStarter.setDefaultSystemProps();

        new SpringApplicationBuilder(UsersServiceStarter.class).web(true).run(args);
    }
}
