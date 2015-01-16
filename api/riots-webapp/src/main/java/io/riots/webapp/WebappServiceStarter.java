package io.riots.webapp;

import io.riots.core.boot.MongoEnabledServiceStarter;
import io.riots.core.boot.ServiceStarter;
import io.riots.core.filters.RiotsUrlRewriteFilter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
@ComponentScan(basePackages = { "io.riots" }, excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, value = MongoEnabledServiceStarter.class) })
@EnableAutoConfiguration(exclude = { ElasticsearchAutoConfiguration.class,
        ElasticsearchDataAutoConfiguration.class, MongoAutoConfiguration.class,
        MongoDataAutoConfiguration.class })
@EnableDiscoveryClient
@ImportResource(value = {"classpath:spring-basicauth.xml"}) // TODO temporary (T-Systems demo)
//@ImportResource(value = {"classpath:/spring-noauth.xml"})
public class WebappServiceStarter extends SpringBootServletInitializer {

	/**
	 * URL rewriting filter. See file urlrewrite.xml for configuration.
	 * @return
	 */
	@Bean
	public FilterRegistrationBean urlRewriteFilter(){
	    FilterRegistrationBean filterRegBean = new FilterRegistrationBean();
	    RiotsUrlRewriteFilter filter = new RiotsUrlRewriteFilter();
	    filterRegBean.setFilter(filter);
	    filterRegBean.addInitParameter("confPath", "/urlrewrite.xml");
	    return filterRegBean;
	}

	public static void main(String[] args) {
    	ServiceStarter.setDefaultSystemProps();
		new SpringApplication(WebappServiceStarter.class).run(args);
	}

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(WebappServiceStarter.class);
    }

}