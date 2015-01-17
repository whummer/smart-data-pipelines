package io.riots.services;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.netflix.eureka.server.EurekaController;
import org.springframework.cloud.netflix.eureka.server.EurekaServerConfiguration;
import org.springframework.context.annotation.Bean;

/**
 * Created by omoser on 16/01/15.
 */
public class RiotsRegistryConfiguration extends EurekaServerConfiguration {

    @Bean
    @ConditionalOnProperty(prefix = "eureka.dashboard", name = "enabled", matchIfMissing = true)
    public RiotsServiceRegistryController eurekaController() {
        return new RiotsServiceRegistryController();
    }
}
