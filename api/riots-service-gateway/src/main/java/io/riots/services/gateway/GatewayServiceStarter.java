package io.riots.services.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.stereotype.Controller;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * @author whummer
 */
@EnableAutoConfiguration
@EnableZuulProxy
@Controller
public class GatewayServiceStarter extends WebMvcConfigurerAdapter {

	public static void main(String[] args) {
		if(System.getProperty("RIOTS_LOG_DIR") == null) {
			System.setProperty("RIOTS_LOG_DIR", "log");
		}
		SpringApplication.run(GatewayServiceStarter.class, args);
	}

}
