package io.riots.services;

import io.riots.api.services.jms.EventBroker;
import io.riots.core.boot.MongoEnabledServiceStarter;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.activemq.broker.BrokerService;
import org.apache.activemq.broker.jmx.ManagementContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;

/**
 * @author omoser
 * @author whummer
 */
@EnableDiscoveryClient
@EnableJms
public class EnvironmentServiceStarter extends MongoEnabledServiceStarter {

    @Value("${activemq.brokerURL}")
    String messagingBrokerURL;

	@Bean
	public BrokerService broker() throws Exception {
		EventBroker.setBrokerURL(messagingBrokerURL);
		final BrokerService broker = new BrokerService();
		broker.setPersistent(false);
		ManagementContext managementContext = new ManagementContext();
		managementContext.setCreateConnector(false);
		broker.setManagementContext(managementContext);
		return broker;
	}

	@Bean
	public ActiveMQConnectionFactory getFactory() {
        ActiveMQConnectionFactory fac = new ActiveMQConnectionFactory(messagingBrokerURL);
        return fac;
	}

	@Bean
    public DefaultJmsListenerContainerFactory getContainerFactory() {
        DefaultJmsListenerContainerFactory factory =
                new DefaultJmsListenerContainerFactory();
        ActiveMQConnectionFactory fac = new ActiveMQConnectionFactory(messagingBrokerURL);
        factory.setConnectionFactory(fac);
        factory.setConcurrency("3-10");
        return factory;
    }

    public static void main(String[] args) throws Exception {
		if(System.getProperty("RIOTS_LOG_DIR") == null) {
			System.setProperty("RIOTS_LOG_DIR", "log");
		}
        SpringApplication.run(EnvironmentServiceStarter.class, args);
    }

}
