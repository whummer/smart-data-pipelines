package com.viotualize.boot;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.embedded.ServletRegistrationBean;
import org.springframework.context.annotation.*;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.servlets.MetricsServlet;
import com.mongodb.Mongo;
import com.netflix.hystrix.contrib.metrics.eventstream.HystrixMetricsStreamServlet;
import com.ryantenney.metrics.spring.config.annotation.EnableMetrics;
import com.viotualize.api.cxf.RefIdEnabledCxfServlet;
import com.wordnik.swagger.jaxrs.config.BeanConfig;

/**
 * @author omoser
 */
@EnableAutoConfiguration
@EnableMongoRepositories(
        basePackages = {"com.viotualize.core.repositories"},
        excludeFilters = @ComponentScan.Filter(type = FilterType.REGEX, pattern = "com\\.viotualize\\.core\\.repositories\\.BaseObjectRepository")
)
@Configuration
@ComponentScan(basePackages = {"com.viotualize"})
@ImportResource(value = {"classpath*:/cxf-config.xml"})
@EnableMetrics // todo om: register JVM metrics
public abstract class ServiceStarter  { // extends AbstractCloudConfig {   

    @Bean
    public ServletRegistrationBean cxfServletRegistrationBean() {
        return new ServletRegistrationBean(new RefIdEnabledCxfServlet(), "/api/*");
    }

    @Bean
    @Autowired
    public ServletRegistrationBean codahaleMetricsServletRegistrationBean(MetricRegistry metricRegistry) {
        return new ServletRegistrationBean(new MetricsServlet(metricRegistry), "/codahale-metrics");
    }
    
    @Bean
    @Autowired
    public ServletRegistrationBean hystrixServletRegistrationBean() {
        return new ServletRegistrationBean(new HystrixMetricsStreamServlet(), "/hystrix.stream");
    }
    

    @Bean
    public BeanConfig swaggerConfig() {
        BeanConfig swaggerConfig = new BeanConfig();
        swaggerConfig.setScan(true);
        swaggerConfig.setTitle("Viotualize API");
        swaggerConfig.setBasePath("http://localhost:8080/api/v1");
        swaggerConfig.setVersion("0.0.1");
        swaggerConfig.setDescription("~~~ Let me vIoTualize you ~~~");
        swaggerConfig.setResourcePackage("com.viotualize.api.services");
        return swaggerConfig;
    }

    @Bean
    @Autowired
    public MongoDbFactory mongoDbFactory(Mongo mongo) {
        return new SimpleMongoDbFactory(mongo, "viotualize");
    }

    /*@Bean
    public MongoDbFactory mongoDbFactory() {
        return connectionFactory().mongoDbFactory("viotualize");
    }

    @Bean
    public Properties cloudProperties() {
        return properties();
    }*/

}
