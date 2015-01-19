package io.riots.boot.starters;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.Slf4jReporter;
import io.riots.core.cxf.RefIdEnabledCxfServlet;

// TODO fix this import com.codahale.metrics.servlets.MetricsServlet;
//import com.google.inject.servlet.GuiceFilter;
//import com.netflix.hystrix.contrib.metrics.eventstream.HystrixMetricsStreamServlet;
//import com.netflix.karyon.server.guice.KaryonGuiceContextListener;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.embedded.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;

import java.util.concurrent.TimeUnit;

/**
 * @author omoser
 * @author riox
 */

@Configuration
@ImportResource(value = { "classpath*:/cxf-config.xml" })
public abstract class ServiceStarter {

    static final Logger metricsLogger = LoggerFactory.getLogger("riots-metrics-logger");


	@Bean
	public ServletRegistrationBean cxfServletRegistrationBean() {
		return new ServletRegistrationBean(new RefIdEnabledCxfServlet(), "/api/*");
	}

    @Autowired
    public void configureReporters(MetricRegistry metricRegistry) {
        Slf4jReporter
                .forRegistry(metricRegistry)
                .outputTo(metricsLogger)
                .build()
                .start(1, TimeUnit.MINUTES);
    }

	public static void setDefaultSystemProps() {
		if (StringUtils.isEmpty(System.getProperty("RIOTS_LOG_DIR"))) {
			System.setProperty("RIOTS_LOG_DIR", "log");
		}
	}

}
