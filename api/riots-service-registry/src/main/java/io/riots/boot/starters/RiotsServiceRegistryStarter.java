package io.riots.boot.starters;

import io.riots.api.services.registry.EnableRiotsServiceRegistry;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoDataAutoConfiguration;
import org.springframework.context.annotation.Configuration;

/**
 * Created by omoser on 22/12/14.
 *
 * @author omoser
 */
@Configuration
@EnableAutoConfiguration(exclude = {
        ElasticsearchAutoConfiguration.class,
        ElasticsearchDataAutoConfiguration.class,
        MongoAutoConfiguration.class,
        MongoDataAutoConfiguration.class
})
@EnableRiotsServiceRegistry
public class RiotsServiceRegistryStarter {

    public static void main(String[] args) {
        SpringApplication.run(RiotsServiceRegistryStarter.class, args);
    }

}
