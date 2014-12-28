package io.riots.core.boot;

import io.riots.core.cxf.RefIdEnabledCxfServlet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.embedded.ServletRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.ImportResource;
// TODO fix this import com.codahale.metrics.servlets.MetricsServlet;
//import com.google.inject.servlet.GuiceFilter;
//import com.netflix.hystrix.contrib.metrics.eventstream.HystrixMetricsStreamServlet;
//import com.netflix.karyon.server.guice.KaryonGuiceContextListener;

/**
 * @author omoser
 * @author riox
 */
@EnableAutoConfiguration
@Configuration
@ComponentScan(basePackages = {"io.riots"}, 
	excludeFilters = @ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = "io\\.riots\\.core\\.handlers.*"))
@ImportResource(value = { "classpath*:/cxf-config.xml" })
//@EnableMetrics
public abstract class ServiceStarter {

    @Autowired
	protected ApplicationContext context;

	@Bean
	public ServletRegistrationBean cxfServletRegistrationBean() {
		return new ServletRegistrationBean(new RefIdEnabledCxfServlet(), "/api/*");
	}	
	
// TODO fix this
//	@Bean
//	@Autowired
//	public ServletRegistrationBean codahaleMetricsServletRegistrationBean(MetricRegistry metricRegistry) {
//		return new ServletRegistrationBean(new MetricsServlet(metricRegistry), "/codahale-metrics");
//	}

//	@Bean
//	public BeanConfig swaggerConfig() {
//		BeanConfig swaggerConfig = new BeanConfig();
//		swaggerConfig.setScan(true);
//		swaggerConfig.setTitle("riots API");
//		swaggerConfig.setBasePath("http://localhost:8080/api/v1");
//		swaggerConfig.setVersion("0.0.1");
//		swaggerConfig.setDescription("~~~ Let's start a riot ~~~");
//		swaggerConfig.setResourcePackage("io.riots");
//		return swaggerConfig;
//	}

}
