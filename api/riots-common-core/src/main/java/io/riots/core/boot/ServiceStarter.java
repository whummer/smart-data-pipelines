package io.riots.core.boot;

import io.riots.core.cxf.RefIdEnabledCxfServlet;

import java.util.concurrent.TimeUnit;
// TODO fix this import com.codahale.metrics.servlets.MetricsServlet;
//import com.google.inject.servlet.GuiceFilter;
//import com.netflix.hystrix.contrib.metrics.eventstream.HystrixMetricsStreamServlet;
//import com.netflix.karyon.server.guice.KaryonGuiceContextListener;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.embedded.ServletRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;

import com.codahale.metrics.ConsoleReporter;
import com.codahale.metrics.MetricRegistry;

/**
 * @author omoser
 * @author riox
 */

@Configuration
@ImportResource(value = { "classpath*:/cxf-config.xml" })
public abstract class ServiceStarter {

    @Autowired
	protected ApplicationContext context;

	@Bean
	public ServletRegistrationBean cxfServletRegistrationBean() {
		return new ServletRegistrationBean(new RefIdEnabledCxfServlet(), "/api/*");
	}

    @Autowired
    public void configureReporters(MetricRegistry metricRegistry) {
        ConsoleReporter
                .forRegistry(metricRegistry)
                .build()
                .start(1, TimeUnit.MINUTES);
    }

	public static void setDefaultSystemProps() {
		if (StringUtils.isEmpty(System.getProperty("RIOTS_LOG_DIR"))) {
			System.setProperty("RIOTS_LOG_DIR", "log");
		}
    	if (StringUtils.isEmpty(System.getProperty("spring.profiles.active"))) {
            System.setProperty("spring.profiles.active", "eureka-embedded");
        }
	}

}
