package io.riots.boot.starters;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.boot.autoconfigure.jms.activemq.ActiveMQAutoConfiguration;
import org.springframework.boot.autoconfigure.jmx.JmxAutoConfiguration;
import org.springframework.cloud.netflix.archaius.ArchaiusAutoConfiguration;
import org.springframework.cloud.netflix.ribbon.RibbonAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * Created by omoser on 19/01/15.
 *
 * @author omoser
 */
@EnableMongoRepositories(basePackages = {"io.riots.core.repositories"})
@EnableAutoConfiguration(exclude = {
        JmxAutoConfiguration.class, ArchaiusAutoConfiguration.class,
        RibbonAutoConfiguration.class, ActiveMQAutoConfiguration.class
})
public class MongoEnabledServiceStarter extends ServiceStarter {

    @Value("${mongodb.hostname}")
    String hostname;

    @Value("${mongodb.connectTimeout:5000}")
    String connectTimeout;

    @Bean
    public MongoDbFactory mongoDbFactory() throws Exception {
        MongoClientOptions options = MongoClientOptions.builder().connectTimeout(Integer.parseInt(connectTimeout)).build();
        return new SimpleMongoDbFactory(new MongoClient(hostname, options), "riots");
    }

    @Bean
    @Autowired
    public MongoTemplate mongoTemplate(MongoDbFactory mongoDbFactory) throws Exception {
        return new MongoTemplate(mongoDbFactory);
    }

}
