package io.riots.boot.starters;

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
