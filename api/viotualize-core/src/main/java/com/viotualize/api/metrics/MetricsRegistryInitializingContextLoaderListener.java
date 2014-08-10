package com.viotualize.api.metrics;



import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.WebApplicationContext;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.http.HttpSessionAttributeListener;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;
import javax.servlet.http.HttpSessionBindingEvent;

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