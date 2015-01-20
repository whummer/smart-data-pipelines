package io.riots.boot.starters;

import io.riots.core.auth.CORSFilter;
import org.apache.cxf.feature.LoggingFeature;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

/**
 * Server starter for the FilesService
 *
 * @author riox
 */
@EnableAutoConfiguration
@EnableDiscoveryClient
@EnableCircuitBreaker
public class FilesServiceStarter extends ServiceStarter {

	public static void main(String[] args) {
		ServiceStarter.setDefaultSystemProps();
		new SpringApplicationBuilder(FilesServiceStarter.class).run(args);
	}

	@Bean
	public CORSFilter corsFilter() {
		return new CORSFilter();
	}

	@Bean
	public LoggingFeature loggingFeature() {
		LoggingFeature loggingFeature = new LoggingFeature();
		loggingFeature.setPrettyLogging(true);
		return loggingFeature;
	}
}
