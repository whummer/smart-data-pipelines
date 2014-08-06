package com.viotualize.api;

import com.mongodb.Mongo;
import com.wordnik.swagger.jaxrs.config.BeanConfig;
import org.apache.cxf.transport.servlet.CXFServlet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.embedded.ServletRegistrationBean;
import org.springframework.context.annotation.*;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

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
public class Api {

    public static void main(String[] args) {
        SpringApplication.run(Api.class);
    }

    @Bean
    public ServletRegistrationBean servletRegistrationBean(){
        return new ServletRegistrationBean(new CXFServlet(),"/api/*");
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
}
