package io.riots.services.gateway;

import io.riots.core.auth.AuthFilterZuul;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;

/**
 * @author whummer
 */
@Configuration
@EnableAutoConfiguration
@ComponentScan
@EnableZuulProxy
@ImportResource(value = { "classpath*:/spring-auth-filter.xml" })
public class GatewayServiceStarter {
	
	@Bean
    public AuthFilterZuul filter() {
        return new AuthFilterZuul();
    }

    public static void main(String[] args) {
        if (System.getProperty("RIOTS_LOG_DIR") == null) {
            System.setProperty("RIOTS_LOG_DIR", "log");
        }
        SpringApplication.run(GatewayServiceStarter.class, args);
    }

}
