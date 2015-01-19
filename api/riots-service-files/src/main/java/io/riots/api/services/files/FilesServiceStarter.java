package io.riots.api.services.files;

import io.riots.boot.starters.ServiceStarter;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

/**
 * Server starter for the FilesService
 *
 * @author riox
 */
@ComponentScan(basePackages = {"io.riots.core", "io.riots.api"})
@EnableAutoConfiguration(exclude = {ElasticsearchAutoConfiguration.class,
        ElasticsearchDataAutoConfiguration.class, MongoAutoConfiguration.class,
        MongoDataAutoConfiguration.class})
@EnableDiscoveryClient
@EnableCircuitBreaker
public class FilesServiceStarter extends ServiceStarter {

    public static void main(String[] args) {
        ServiceStarter.setDefaultSystemProps();
        new SpringApplicationBuilder(FilesServiceStarter.class).run(args);
    }

}
