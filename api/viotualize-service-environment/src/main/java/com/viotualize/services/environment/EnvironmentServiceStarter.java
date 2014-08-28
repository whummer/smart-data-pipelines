package com.viotualize.services.environment;

import com.mongodb.Mongo;
import com.mongodb.MongoClient;
import com.viotualize.core.boot.MongoEnabledServiceStarter;
import com.viotualize.core.boot.ServiceStarter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.net.UnknownHostException;

/**
 * @author omoser
 */

public class EnvironmentServiceStarter extends MongoEnabledServiceStarter {

    public static void main(String[] args) {
        SpringApplication.run(EnvironmentServiceStarter.class, args);
    }

}
