package io.riots.webapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ImportResource;
import org.tuckey.web.filters.urlrewrite.UrlRewriteFilter;

@SpringBootApplication
@EnableAutoConfiguration
@EnableDiscoveryClient
@ImportResource(value = {"classpath:/spring-noauth.xml"})
public class WebappServiceStarter extends SpringBootServletInitializer {

	/**
	 * URL rewriting filter. See WEB-INF/urlrewrite.xml for configuration.
	 * @return
	 */
	@Bean
	UrlRewriteFilter getRewriteFilter() {
		UrlRewriteFilter f = new UrlRewriteFilter();
		return f;
	}

	public static void main(String[] args) {
		if(System.getProperty("RIOTS_LOG_DIR") == null) {
			System.setProperty("RIOTS_LOG_DIR", "log");
		}
		new SpringApplication(WebappServiceStarter.class).run(args);
	}

}