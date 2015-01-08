package io.riots.services.catalog;

import io.riots.core.boot.ServiceStarter;

import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoDataAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * @author riox
 */
@EnableElasticsearchRepositories(basePackages = { "io.riots.catalog.repositories" },
	excludeFilters = @ComponentScan.Filter(type = FilterType.REGEX,
											pattern = "io\\.riots\\.core\\.repositories\\.BaseObjectRepository"))

@EnableAutoConfiguration(exclude = {MongoAutoConfiguration.class, MongoDataAutoConfiguration.class})
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
	public ElasticsearchTemplate elasticsearchTemplate(Client transportClient) throws Exception {
		return new ElasticsearchTemplate(transportClient);
	}

}
