package io.riots.boot.starters;

import io.riots.core.auth.CORSFilter;
import io.riots.core.jms.RiotsJmsConfiguration;
import org.apache.activemq.broker.BrokerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.jms.annotation.EnableJms;

/**
 * @author whummer
 */
@EnableDiscoveryClient
@EnableJms
@Configuration
@Import(RiotsJmsConfiguration.class)
public class SimulationServiceStarter extends MongoEnabledServiceStarter {

	@Bean
	public CORSFilter corsFilter() {
		return new CORSFilter();
	}

	public static void main(String[] args) {
    	ServiceStarter.setDefaultSystemProps();
		BrokerFactory.setStartDefault(false);
		SpringApplication.run(SimulationServiceStarter.class, args);
	}

}
