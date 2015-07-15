package io.riots.boot.starters;

import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.DiscoveryClient;
import com.netflix.discovery.shared.Application;
import org.elasticsearch.client.Client;
import org.elasticsearch.node.NodeBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;


/**
 * @author omoser
 */
@EnableAutoConfiguration(exclude = ElasticsearchAutoConfiguration.class)
@EnableElasticsearchRepositories(basePackages = {"io.riots.core.repositories"})
public class CatalogServiceTestStarter extends ServiceStarter {

	@Value("${basedir}/target/data")
	String dataDirectory;

	public static void main(String[] args) {
		ServiceStarter.setDefaultSystemProps();
		new SpringApplicationBuilder(CatalogServiceTestStarter.class).web(true).run(args);
	}

	@Bean
	public Client client() throws InterruptedException {
		NodeBuilder builder = NodeBuilder.nodeBuilder().local(true);
		builder.settings().put("path.data", dataDirectory);
		return builder.node().client();
	}

	@Bean
	@Autowired
	public ElasticsearchTemplate elasticsearchTemplate(Client client) throws InterruptedException {
		return new ElasticsearchTemplate(client);
	}

	@Bean
	public DiscoveryClient mockDiscoveryClient() {
		DiscoveryClient discoveryClient = mock(DiscoveryClient.class);
		InstanceInfo.Builder builder = InstanceInfo.Builder.newBuilder();

		// todo wrong port. we might want to fire up the files-service or at least mock the interaction.
		Application filesService = new Application("files-service");
		filesService.addInstance(builder
						.setHostName("localhost")
						.setIPAddr("127.0.0.1")
						.setPort(8888)
						.setAppName("files-service")
						.build()
		);

		when(discoveryClient.getApplication("files-service")).thenReturn(filesService);

		// guys please note that catalog-service is mocked in CatalogServiceTest since we don't know the port yet
		return discoveryClient;
	}

}
