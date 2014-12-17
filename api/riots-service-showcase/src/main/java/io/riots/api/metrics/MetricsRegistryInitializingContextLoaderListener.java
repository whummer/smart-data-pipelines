package io.riots.api.metrics;

import javax.servlet.ServletContextEvent;

import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.WebApplicationContext;

/**
 * @author omoser
 */
public class MetricsRegistryInitializingContextLoaderListener extends ContextLoaderListener {
    public static final String REGISTRY_NAME = "com.codahale.metrics.servlets.MetricsServlet.registry";

    @Override
    public void contextInitialized(ServletContextEvent event) {
        super.contextInitialized(event);
        WebApplicationContext context = getCurrentWebApplicationContext();
        Object registry = context.getBean("metrics");
        event.getServletContext().setAttribute(REGISTRY_NAME, registry);
    }
}