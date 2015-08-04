package io.riots.boot.starters;

import io.riots.core.auth.CORSFilter;
import io.riots.core.jms.RiotsJmsConfiguration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.jms.annotation.EnableJms;

/**
 * @author omoser
 * @author whummer
 */
@EnableDiscoveryClient
@EnableJms
@Configuration
@EnableMongoRepositories(basePackages = {"io.riots.core.repositories"})
@EnableAutoConfiguration
@Import(RiotsJmsConfiguration.class)
public class EnvironmentServiceStarter extends MongoEnabledServiceStarter {

    @Bean
    public CORSFilter corsFilter() {
        return new CORSFilter();
    }

    public static void main(String[] args) throws Exception {
        ServiceStarter.setDefaultSystemProps();
        SpringApplication.run(EnvironmentServiceStarter.class, args);
    }

}
