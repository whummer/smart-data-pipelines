package io.riots.boot.starters;

import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoDataAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * @author riox
 */
@EnableElasticsearchRepositories(elasticsearchTemplateRef = "elasticsearchTemplate", basePackages = {"io.riots.core.repositories"})
@EnableAutoConfiguration
@ComponentScan(basePackages = {"io.riots.core", "io.riots.api"})
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
    @Autowired
    public ElasticsearchTemplate elasticsearchTemplate(Client transportClient) {
        return new ElasticsearchTemplate(transportClient);
    }

}