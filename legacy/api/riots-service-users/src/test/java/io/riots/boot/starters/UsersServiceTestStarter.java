package io.riots.boot.starters;

import static org.mockito.Mockito.mock;

import java.net.UnknownHostException;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import com.github.fakemongo.Fongo;
import com.mongodb.Mongo;
import com.netflix.discovery.DiscoveryClient;


/**
 * @author whummer
 */
@EnableAutoConfiguration(exclude = MongoAutoConfiguration.class)
@EnableMongoRepositories(basePackages = {"io.riots.core.repositories"})
public class UsersServiceTestStarter extends ServiceStarter {

	public static void main(String[] args) {
		ServiceStarter.setDefaultSystemProps();
		new SpringApplicationBuilder(UsersServiceTestStarter.class).web(true).run(args);
	}

	@Bean
	public DiscoveryClient mockDiscoveryClient() {
		DiscoveryClient discoveryClient = mock(DiscoveryClient.class);
		return discoveryClient;
	}

	@Bean
	public Mongo getMongo() throws UnknownHostException {
		Fongo f = new Fongo("testMongo");
		return f.getMongo();
	}

}
