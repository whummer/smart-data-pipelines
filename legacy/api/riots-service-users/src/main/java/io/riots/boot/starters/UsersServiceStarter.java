package io.riots.boot.starters;

import io.riots.core.auth.CORSFilter;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

/**
 * @author whummer
 */
@EnableDiscoveryClient
@EnableCircuitBreaker
public class UsersServiceStarter extends MongoEnabledServiceStarter {

    @Bean
    public CORSFilter corsFilter() {
        return new CORSFilter();
    }

    public static void main(String[] args) {
    	ServiceStarter.setDefaultSystemProps();
        new SpringApplicationBuilder(UsersServiceStarter.class).web(true).run(args);
    }
}
