package io.riots.boot.starters;

import io.riots.core.jms.EventBroker;
import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.activemq.broker.BrokerFactory;
import org.apache.activemq.broker.BrokerService;
import org.apache.activemq.broker.jmx.ManagementContext;
import org.apache.activemq.command.ActiveMQTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;
import org.springframework.jms.core.JmsTemplate;

import javax.jms.Topic;

/**
 * @author whummer
 */
@EnableDiscoveryClient
@EnableJms
public class SimulationServiceStarter extends MongoEnabledServiceStarter {

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
		return new ActiveMQConnectionFactory(messagingBrokerURL);
	}

	@Bean
	public DefaultJmsListenerContainerFactory topicContainerFactory() {
		DefaultJmsListenerContainerFactory factory = new DefaultJmsListenerContainerFactory();
        ActiveMQConnectionFactory fac = new ActiveMQConnectionFactory(messagingBrokerURL);
        factory.setConnectionFactory(fac);
        factory.setPubSubDomain(true);
		return factory;
	}

	@Bean(name="jmsTopicTemplate")
	public JmsTemplate jmsTopicTemplate() {
		JmsTemplate t = new JmsTemplate();
        ActiveMQConnectionFactory fac = new ActiveMQConnectionFactory(messagingBrokerURL);
        t.setConnectionFactory(fac);
		return t;
	}


	@Bean(name=EventBroker.MQ_INBOUND_PROP_UPDATE)
	public Topic getPropUpdateTopic() {
		return new ActiveMQTopic(EventBroker.MQ_INBOUND_PROP_UPDATE);
	}
	@Bean(name=EventBroker.MQ_OUTBOUND_PROP_CHANGE_NOTIFY)
	public Topic getPropChangeTopic() {
		return new ActiveMQTopic(EventBroker.MQ_OUTBOUND_PROP_CHANGE_NOTIFY);
	}

	public static void main(String[] args) {
    	ServiceStarter.setDefaultSystemProps();
		BrokerFactory.setStartDefault(false);
		SpringApplication.run(SimulationServiceStarter.class, args);
	}

}
