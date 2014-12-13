package io.riots.webapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableAutoConfiguration
public class WebappServiceStarter {
	
	public static void main(String[] args) {
      new SpringApplication(WebappServiceStarter.class).run(args);
	}

}