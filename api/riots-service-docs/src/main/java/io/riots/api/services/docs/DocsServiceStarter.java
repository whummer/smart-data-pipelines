package io.riots.api.services.docs;

import com.wordnik.swagger.jaxrs.config.BeanConfig;
import io.riots.boot.starters.ServiceStarter;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

/**
 * @author omoser
 */
@EnableDiscoveryClient
@ComponentScan(basePackages = { "io.riots.core", "io.riots.api" })
@EnableAutoConfiguration(exclude = {
        ElasticsearchAutoConfiguration.class, ElasticsearchDataAutoConfiguration.class,
        MongoAutoConfiguration.class, MongoDataAutoConfiguration.class
})
public class DocsServiceStarter extends ServiceStarter {

    public static void main(String[] args) {
    	ServiceStarter.setDefaultSystemProps();
        new SpringApplicationBuilder(DocsServiceStarter.class).web(true).run(args);
    }

  	@Bean
	public BeanConfig swaggerConfig() {
		BeanConfig swaggerConfig = new BeanConfig();
		swaggerConfig.setScan(true);
		swaggerConfig.setTitle("riots API");
		//swaggerConfig.setBasePath("http://TODO_HOSTNAME:8080/api/v1");
		swaggerConfig.setVersion("0.0.1");
		swaggerConfig.setDescription("~~~ Let's start a riot ~~~");
		swaggerConfig.setResourcePackage("io.riots.api.services");
		return swaggerConfig;
	}
}
