package io.riots.boot.starters;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import io.riots.core.auth.CORSFilter;
import io.riots.core.jms.EventBroker;
import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.activemq.broker.BrokerService;
import org.apache.activemq.broker.jmx.ManagementContext;
import org.apache.activemq.command.ActiveMQTopic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;
import org.springframework.jms.core.JmsTemplate;

import javax.jms.Topic;

/**
 * @author omoser
 * @author whummer
 */
@EnableDiscoveryClient
@EnableJms
@Configuration
@EnableMongoRepositories(basePackages = {"io.riots.core.repositories"})
@EnableAutoConfiguration(exclude = {ElasticsearchAutoConfiguration.class, ElasticsearchDataAutoConfiguration.class})
@ComponentScan(basePackages = {"io.riots.core", "io.riots.api"})
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
        return new ActiveMQConnectionFactory(messagingBrokerURL);
    }

    @Bean
    public DefaultJmsListenerContainerFactory topicContainerFactory() {
        DefaultJmsListenerContainerFactory factory =
                new DefaultJmsListenerContainerFactory();
        ActiveMQConnectionFactory fac = new ActiveMQConnectionFactory(messagingBrokerURL);
        factory.setConnectionFactory(fac);
        factory.setPubSubDomain(true);
        return factory;
    }

    @Bean(name = "jmsTopicTemplate")
    public JmsTemplate jmsTopicTemplate() {
        JmsTemplate t = new JmsTemplate();
        ActiveMQConnectionFactory fac = new ActiveMQConnectionFactory(messagingBrokerURL);
        t.setConnectionFactory(fac);
        return t;
    }

    @Bean(name = EventBroker.MQ_INBOUND_PROP_UPDATE)
    public Topic getPropUpdateTopic() {
        return new ActiveMQTopic(EventBroker.MQ_INBOUND_PROP_UPDATE);
    }

    @Bean(name = EventBroker.MQ_OUTBOUND_PROP_CHANGE_NOTIFY)
    public Topic getPropChangeTopic() {
        return new ActiveMQTopic(EventBroker.MQ_OUTBOUND_PROP_CHANGE_NOTIFY);
    }

    @Bean
    public CORSFilter corsFilter() {
        return new CORSFilter();
    }

    public static void main(String[] args) throws Exception {
        ServiceStarter.setDefaultSystemProps();
        SpringApplication.run(EnvironmentServiceStarter.class, args);
    }

}
