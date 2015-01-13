package io.riots.services;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoDataAutoConfiguration;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;

/**
 * Created by omoser on 22/12/14.
 */
@Configuration
@EnableAutoConfiguration(exclude = { ElasticsearchAutoConfiguration.class,
        ElasticsearchDataAutoConfiguration.class, MongoAutoConfiguration.class,
        MongoDataAutoConfiguration.class })
@EnableEurekaServer
public class ServiceRegistry {

    public static void main(String[] args) {
        SpringApplication.run(ServiceRegistry.class, args);
    }
}
