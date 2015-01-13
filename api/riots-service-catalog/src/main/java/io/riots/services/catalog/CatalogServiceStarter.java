package io.riots.services.catalog;

import com.ryantenney.metrics.spring.config.annotation.EnableMetrics;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

/**
 * @author omoser
 * @author riox
 */
@EnableDiscoveryClient
@EnableCircuitBreaker
// todo @EnableMetrics clashes with @Context MessageContext injection in the service impl classes
//@EnableMetrics(proxyTargetClass = true, exposeProxy = true)
public class CatalogServiceStarter extends ElasticSearchEnabledServiceStarter {
	
	public static void main(String[] args) {
        if (System.getProperty("RIOTS_LOG_DIR") == null) {
            System.setProperty("RIOTS_LOG_DIR", "log");
        }
        new SpringApplicationBuilder(CatalogServiceStarter.class).web(true).run(args);
	}

}
