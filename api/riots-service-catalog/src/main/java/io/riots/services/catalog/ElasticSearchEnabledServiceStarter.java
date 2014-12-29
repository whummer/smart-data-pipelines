package io.riots.services.catalog;

import io.riots.core.boot.ServiceStarter;

import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.springframework.beans.factory.annotation.Autowired;
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
public class ElasticSearchEnabledServiceStarter extends ServiceStarter {

	@SuppressWarnings("resource")
	@Autowired
	public Client transportClient() {
		// TODO read the hosts from application.yml or better Eureka
		TransportClient client = new TransportClient();
		client.addTransportAddress(new InetSocketTransportAddress(
						"localhost", 9300));
		// .addTransportAddress(new InetSocketTransportAddress("host2", 9300));
		return client;
	}

	@Bean
	public ElasticsearchTemplate elasticsearchTemplate() throws Exception {
		return new ElasticsearchTemplate(transportClient());
	}

}
