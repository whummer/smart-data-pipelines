package io.riots.api.services.docs;

import io.riots.boot.starters.ServiceStarter;
import io.riots.core.auth.CORSFilter;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

import com.wordnik.swagger.jaxrs.config.BeanConfig;

/**
 * @author omoser
 */
@EnableDiscoveryClient
@EnableAutoConfiguration
public class DocsServiceStarter extends ServiceStarter {

	@Bean
	public CORSFilter corsFilter() {
		return new CORSFilter();
	}

  	@Bean
	public BeanConfig swaggerConfig() {
		BeanConfig swaggerConfig = new BeanConfig();
		swaggerConfig.setScan(true);
		swaggerConfig.setTitle("riots API");
		swaggerConfig.setVersion("0.0.1");
		swaggerConfig.setDescription("riots.io - IoT at its best.");
		swaggerConfig.setResourcePackage("io.riots.api.services");
		return swaggerConfig;
	}

	public static void main(String[] args) {
		ServiceStarter.setDefaultSystemProps();
		new SpringApplicationBuilder(DocsServiceStarter.class).web(true).run(args);
	}
}
