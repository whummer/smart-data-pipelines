package com.viotualize.core.boot;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.servlets.MetricsServlet;
import com.google.inject.servlet.GuiceFilter;
import com.netflix.hystrix.contrib.metrics.eventstream.HystrixMetricsStreamServlet;
import com.netflix.karyon.server.guice.KaryonGuiceContextListener;
import com.ryantenney.metrics.spring.config.annotation.EnableMetrics;
import com.viotualize.core.cxf.RefIdEnabledCxfServlet;
import com.wordnik.swagger.jaxrs.config.BeanConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.boot.context.embedded.ServletListenerRegistrationBean;
import org.springframework.boot.context.embedded.ServletRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;

/**
 * @author omoser
 * @author riox
 */
@EnableAutoConfiguration
@Configuration
@ComponentScan(basePackages = { "com.viotualize" })
@ImportResource(value = { "classpath*:/cxf-config.xml" })
@EnableMetrics
public abstract class ServiceStarter { // extends AbstractCloudConfig {
	
	@Autowired
	protected ApplicationContext context;

	@Bean
	public ServletRegistrationBean cxfServletRegistrationBean() {
		return new ServletRegistrationBean(new RefIdEnabledCxfServlet(), "/api/*");
	}
	
	@Bean
	public FilterRegistrationBean googleGuiceBean() {
		return new FilterRegistrationBean(new GuiceFilter());		
	}
	
	@Bean
	public ServletListenerRegistrationBean<KaryonGuiceContextListener> karyonListner() {
		return new ServletListenerRegistrationBean<>(new KaryonGuiceContextListener());
	}
	
	@Bean
	@Autowired
	public ServletRegistrationBean codahaleMetricsServletRegistrationBean(MetricRegistry metricRegistry) {
		return new ServletRegistrationBean(new MetricsServlet(metricRegistry), "/codahale-metrics");
	}

	@Bean
	@Autowired
	public ServletRegistrationBean hystrixServletRegistrationBean() {
		return new ServletRegistrationBean(new HystrixMetricsStreamServlet(),
				"/hystrix.stream");
	}

	@Bean
	public BeanConfig swaggerConfig() {
		BeanConfig swaggerConfig = new BeanConfig();
		swaggerConfig.setScan(true);
		swaggerConfig.setTitle("Viotualize API");
		swaggerConfig.setBasePath("http://localhost:8080/api/v1");
		swaggerConfig.setVersion("0.0.1");
		swaggerConfig.setDescription("~~~ Let me vIoTualize you ~~~");
		swaggerConfig.setResourcePackage("com.viotualize");
		return swaggerConfig;
	}

}
