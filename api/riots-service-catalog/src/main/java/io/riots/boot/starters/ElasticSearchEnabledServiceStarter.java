package io.riots.boot.starters;

import io.riots.boot.health.ElasticsearchHealthIndicator;

import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jms.activemq.ActiveMQAutoConfiguration;
import org.springframework.boot.autoconfigure.jmx.JmxAutoConfiguration;
import org.springframework.cloud.netflix.archaius.ArchaiusAutoConfiguration;
import org.springframework.cloud.netflix.ribbon.RibbonAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * @author riox
 */
@EnableElasticsearchRepositories(elasticsearchTemplateRef = "elasticsearchTemplate", basePackages = {"io.riots.core.repositories"})
@EnableAutoConfiguration(exclude = {
        JmxAutoConfiguration.class, ArchaiusAutoConfiguration.class,
        RibbonAutoConfiguration.class, ActiveMQAutoConfiguration.class
})
public class ElasticSearchEnabledServiceStarter extends ServiceStarter {

    @Value("${elasticsearch.hostname}")
    String hostname;

    @Bean
    public Client transportClient() {
        // TODO read the hosts from application.yml or better Eureka
        TransportClient client = new TransportClient();
        client.addTransportAddress(new InetSocketTransportAddress(hostname, 9300));
        return client;
    }

    @Bean
    public HealthIndicator elasticsearchHealthIndicator() {
        return new ElasticsearchHealthIndicator();
    }

    @Bean
    @Autowired
    public ElasticsearchTemplate elasticsearchTemplate(Client transportClient) {
        return new ElasticsearchTemplate(transportClient);
    }

}
