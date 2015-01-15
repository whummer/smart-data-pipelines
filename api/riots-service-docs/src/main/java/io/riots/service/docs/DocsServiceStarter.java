package io.riots.service.docs;

import com.wordnik.swagger.jaxrs.config.BeanConfig;
import io.riots.core.boot.MongoEnabledServiceStarter;
import io.riots.core.boot.ServiceStarter;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

/**
 * @author omoser
 */
@EnableDiscoveryClient
@ComponentScan(basePackages = { "io.riots" }, excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, value = MongoEnabledServiceStarter.class) })
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
		swaggerConfig.setResourcePackage("io.riots.services");
		return swaggerConfig;
	}
}
