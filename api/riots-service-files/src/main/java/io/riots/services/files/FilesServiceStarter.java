package io.riots.services.files;

import io.riots.core.boot.MongoEnabledServiceStarter;
import io.riots.core.boot.ServiceStarter;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

/**
 * Server starter for the FilesService
 * 
 * @author riox
 */
@ComponentScan(basePackages = { "io.riots" }, excludeFilters = {
		@ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, value = MongoEnabledServiceStarter.class) })
@EnableAutoConfiguration(exclude = { ElasticsearchAutoConfiguration.class,
		ElasticsearchDataAutoConfiguration.class, MongoAutoConfiguration.class,
		MongoDataAutoConfiguration.class })
@EnableDiscoveryClient
@EnableCircuitBreaker
public class FilesServiceStarter extends ServiceStarter {

	public static void main(String[] args) {
		if (System.getProperty("RIOTS_LOG_DIR") == null) {
			System.setProperty("RIOTS_LOG_DIR", "log");
		}
		new SpringApplicationBuilder(FilesServiceStarter.class).run(args);
	}

}
