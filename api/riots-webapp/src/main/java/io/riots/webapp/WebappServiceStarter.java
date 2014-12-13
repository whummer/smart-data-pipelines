package io.riots.webapp;
import io.riots.core.boot.ServiceStarter;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.ImportResource;

@ImportResource(value = { "classpath*:/riots-webapp.xml" })
public class WebappServiceStarter extends ServiceStarter {
	
	public static void main(String[] args) {
        new SpringApplicationBuilder(WebappServiceStarter.class).web(true).run(args);
	}

}
