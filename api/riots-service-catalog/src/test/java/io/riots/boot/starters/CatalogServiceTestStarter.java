package io.riots.boot.starters;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.DiscoveryClient;
import com.netflix.discovery.shared.Application;


/**
 * @author omoser
 */
@EnableAutoConfiguration
@EnableElasticsearchRepositories(basePackages = {"io.riots.core.repositories"})
public class CatalogServiceTestStarter extends ServiceStarter {

	@Bean
	public DiscoveryClient mockDiscoveryClient() {
		DiscoveryClient discoveryClient = mock(DiscoveryClient.class);
		InstanceInfo.Builder builder = InstanceInfo.Builder.newBuilder();

		// todo wrong port. we might want to fire up the files-service or at least mock the interaction.
		Application filesService = new Application("files-service");
		filesService.addInstance(builder.setHostName("localhost").
				setIPAddr("127.0.0.1").setPort(8888).setAppName("files-service").build());
		when(discoveryClient.getApplication("files-service")).thenReturn(filesService);

		// guys please note that catalog-service is mocked in CatalogServiceTest since we don't know the port yet
		return discoveryClient;
	}

	public static void main(String[] args) {
		ServiceStarter.setDefaultSystemProps();
        new SpringApplicationBuilder(CatalogServiceTestStarter.class).web(true).run(args);
	}

}
