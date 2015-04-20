package io.riots.boot.starters;

import io.riots.core.auth.CORSFilter;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

import com.ryantenney.metrics.spring.config.annotation.EnableMetrics;

/**
 * @author omoser
 * @author riox
 */
@EnableDiscoveryClient
@EnableCircuitBreaker
@EnableMetrics(proxyTargetClass = true, exposeProxy = true)
public class CatalogServiceStarter extends ElasticSearchEnabledServiceStarter {

	@Bean
	public CORSFilter corsFilter() {
		return new CORSFilter();
	}

	public static void main(String[] args) {
		ServiceStarter.setDefaultSystemProps();
        new SpringApplicationBuilder(CatalogServiceStarter.class).web(true).run(args);
	}

}
