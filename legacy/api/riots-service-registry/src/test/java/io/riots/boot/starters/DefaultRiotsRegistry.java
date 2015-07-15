package io.riots.boot.starters;

import io.riots.api.services.registry.EnableRiotsServiceRegistry;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Configuration;

/**
 * Created by omoser on 20/01/15.
 *
 * @author omoser
 */

@Configuration
@EnableAutoConfiguration
@EnableRiotsServiceRegistry
@EnableDiscoveryClient
public class DefaultRiotsRegistry {

	public static void main(String[] args) {
		SpringApplication.run(DefaultRiotsRegistry.class, args);
	}

}
