package com.viotualize.core.boot;

import com.viotualize.core.logging.Markers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;

/**
 * @author omoser
 */

public class ServicePortAdvisor implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {

    static final Logger log = LoggerFactory.getLogger(ServicePortAdvisor.class);

    @Override
    public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
        String serverPort = (String) event.getEnvironment().getSystemProperties().get("server.port");
        String eurekaPort = (String) event.getEnvironment().getSystemProperties().get("eureka.port");
        log.debug(Markers.CORE, "server.port={}, eureka.port={}", serverPort, eurekaPort);
        if (eurekaPort == null) {
            event.getEnvironment().getSystemProperties().put("eureka.port", serverPort);
        }

    }
}
