package io.riots.boot.starters;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.servlet.InstrumentedFilter;
import com.codahale.metrics.servlets.MetricsServlet;
import com.ryantenney.metrics.spring.config.annotation.EnableMetrics;
import io.riots.core.auth.CORSFilter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

/**
 * @author omoser
 * @author riox
 */
@EnableDiscoveryClient
@EnableCircuitBreaker
// todo @EnableMetrics clashes with @Context MessageContext injection in the clients impl classes
@EnableMetrics(proxyTargetClass = true, exposeProxy = true)
public class CatalogServiceStarter extends ElasticSearchEnabledServiceStarter {

	/*@Bean
	@Autowired
	public InstrumentedFilter metricsServlet(MetricRegistry registry) {
		return new InstrumentedFilter();
	}


*/
	@Bean
	public CORSFilter corsFilter() {
		return new CORSFilter();
	}

	public static void main(String[] args) {
		ServiceStarter.setDefaultSystemProps();
        new SpringApplicationBuilder(CatalogServiceStarter.class).web(true).run(args);
	}

}
