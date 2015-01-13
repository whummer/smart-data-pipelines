package io.riots.services;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
import org.springframework.context.annotation.Configuration;

/**
 * Created by omoser on 22/12/14.
 */
@Configuration
@EnableAutoConfiguration
@EnableEurekaServer
public class ServiceRegistry {

    public static void main(String[] args) {
        SpringApplication.run(ServiceRegistry.class, args);
    }
}
