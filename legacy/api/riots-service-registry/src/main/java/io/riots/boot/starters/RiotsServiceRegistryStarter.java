package io.riots.boot.starters;

import io.riots.api.services.registry.EnableRiotsServiceRegistry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Configuration;

/**
 * Created by omoser on 22/12/14.
 *
 * @author omoser
 */
@Configuration
@EnableAutoConfiguration
@EnableRiotsServiceRegistry
public class RiotsServiceRegistryStarter {

    public static void main(String[] args) {
    	com.netflix.blitz4j.LoggingConfiguration c;
    	org.springframework.cloud.netflix.eureka.server.EurekaServerInitializerConfiguration c1;

        SpringApplication.run(RiotsServiceRegistryStarter.class, args);
    }

}
