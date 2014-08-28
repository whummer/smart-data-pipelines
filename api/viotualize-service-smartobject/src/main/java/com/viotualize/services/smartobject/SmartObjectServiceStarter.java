package com.viotualize.services.smartobject;

import com.viotualize.core.boot.MongoEnabledServiceStarter;
import org.springframework.boot.SpringApplication;

/**
 * @author omoser
 * @author riox
 */

public class SmartObjectServiceStarter extends MongoEnabledServiceStarter {

    public static void main(String[] args) {
        SpringApplication.run(SmartObjectServiceStarter.class, args);
    }
}
