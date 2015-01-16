package io.riots.services.gateway;

import io.riots.core.boot.ServiceStarter;
import io.riots.core.filters.RiotsUrlRewriteFilter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;

/**
 * @author whummer
 */
@Configuration
@EnableAutoConfiguration(exclude = {ElasticsearchAutoConfiguration.class, ElasticsearchDataAutoConfiguration.class,
        MongoAutoConfiguration.class, MongoDataAutoConfiguration.class})

@ComponentScan(basePackages = {"io.riots.core.auth", "io.riots.core.service"})
@EnableZuulProxy
@ImportResource(value = { "classpath*:/spring-auth-filter.xml" })
public class GatewayServiceStarter {

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

	/**
	 * Simple statistics filter.
	 */
	@Bean
	public FilterRegistrationBean statsFilter(){
	    FilterRegistrationBean filterRegBean = new FilterRegistrationBean();
	    filterRegBean.setFilter(new GatewayStatsFilter("/stats(/)?"));
	    return filterRegBean;
	}

    public static void main(String[] args) {
    	ServiceStarter.setDefaultSystemProps();
        SpringApplication.run(GatewayServiceStarter.class, args);
    }

}
