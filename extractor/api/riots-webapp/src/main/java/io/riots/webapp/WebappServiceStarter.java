package io.riots.webapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ImportResource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@SpringBootApplication
@EnableAutoConfiguration
@EnableDiscoveryClient
@ImportResource(value = {"classpath*:/spring-auth.xml"})
public class WebappServiceStarter extends SpringBootServletInitializer {

	@Controller
    static class FaviconController {
		@RequestMapping("/ui")
		String index() {
			return "forward:/app/index.html";
		}
        @RequestMapping("favicon.ico")
        String favicon() {
            return "forward:/app/favicon.ico";
        }
    }
	
	public static void main(String[] args) {
		if(System.getProperty("RIOTS_LOG_DIR") == null) {
			System.setProperty("RIOTS_LOG_DIR", "log");
		}
		new SpringApplication(WebappServiceStarter.class).run(args);
	}

}