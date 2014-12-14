package io.riots.webapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.RequestMapping;

@SpringBootApplication
@EnableAutoConfiguration
@EnableDiscoveryClient
public class WebappServiceStarter extends SpringBootServletInitializer {

	// TODO: whu->fro: not working apparently
	@RequestMapping("/ui")
	public String foo() {
		return "forward:/app/index.html";
	}

	public static void main(String[] args) {
		new SpringApplication(WebappServiceStarter.class).run(args);
	}

}