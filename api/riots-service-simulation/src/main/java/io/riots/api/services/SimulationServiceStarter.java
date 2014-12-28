package io.riots.api.services;

import io.riots.core.boot.MongoEnabledServiceStarter;

import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;

/**
 * @author whummer
 */
@EnableDiscoveryClient
@EnableJms
public class SimulationServiceStarter extends MongoEnabledServiceStarter {

	@Bean
    public DefaultJmsListenerContainerFactory myContainerFactory() {
        DefaultJmsListenerContainerFactory factory =
                new DefaultJmsListenerContainerFactory();
        factory.setConcurrency("3-10");
        return factory;
    }

	public static void main(String[] args) {
		if(System.getProperty("RIOTS_LOG_DIR") == null) {
			System.setProperty("RIOTS_LOG_DIR", "log");
		}
		SpringApplication.run(SimulationServiceStarter.class, args);
	}

}
