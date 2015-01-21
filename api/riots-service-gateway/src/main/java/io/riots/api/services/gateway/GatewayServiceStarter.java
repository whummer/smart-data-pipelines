package io.riots.api.services.gateway;

import io.riots.core.auth.AuthFilterZuul;
import io.riots.core.auth.CORSFilter;
import io.riots.core.filters.RiotsUrlRewriteFilter;

import org.apache.commons.lang.StringUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.ImportResource;

/**
 * @author whummer
 */
@Configuration
@EnableAutoConfiguration
@ComponentScan(
		basePackages = {"io.riots.api", "io.riots.core"},
		excludeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, value= Configuration.class)
)
@EnableZuulProxy
@ImportResource(value = { "classpath*:/spring-auth-filter.xml" }) // todo try to move this to JavaConfig
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

	@Bean
    public AuthFilterZuul authFilter() {
        return new AuthFilterZuul();
    }

	@Bean
	public CORSFilter corsFilter() {
		return new CORSFilter();
	}

    public static void main(String[] args) {
		if (StringUtils.isEmpty(System.getProperty("RIOTS_LOG_DIR"))) {
			System.setProperty("RIOTS_LOG_DIR", "log");
		}
        SpringApplication.run(GatewayServiceStarter.class, args);
    }

}
