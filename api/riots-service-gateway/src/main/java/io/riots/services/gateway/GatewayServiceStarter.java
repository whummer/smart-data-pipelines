package io.riots.services.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.context.annotation.Configuration;

/**
 * @author whummer
 */
@Configuration
@EnableAutoConfiguration
@EnableZuulProxy
public class GatewayServiceStarter  {
    public static void main(String[] args) {
        if (System.getProperty("RIOTS_LOG_DIR") == null) {
            System.setProperty("RIOTS_LOG_DIR", "log");
        }
        SpringApplication.run(GatewayServiceStarter.class, args);
    }

}
