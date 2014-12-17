package io.riots.services.environment;

import io.riots.core.boot.MongoEnabledServiceStarter;
import org.springframework.boot.SpringApplication;

/**
 * @author omoser
 */

public class EnvironmentServiceStarter extends MongoEnabledServiceStarter {

    public static void main(String[] args) {
        SpringApplication.run(EnvironmentServiceStarter.class, args);
    }

}
