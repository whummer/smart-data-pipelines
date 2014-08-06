package com.viotualize.api.services;

import com.fasterxml.jackson.jaxrs.json.JacksonJaxbJsonProvider;
import com.jayway.restassured.RestAssured;
import com.viotualize.api.Api;
import org.apache.cxf.endpoint.Server;
import org.apache.cxf.feature.Feature;
import org.apache.cxf.feature.LoggingFeature;
import org.apache.cxf.jaxrs.JAXRSServerFactoryBean;
import org.apache.cxf.jaxrs.lifecycle.SingletonResourceProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.ArrayList;
import java.util.List;

import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.assertTrue;

/**
 * @author omoser
 */
//@ContextConfiguration({"classpath*:viotualize-api.xml"})
@ContextConfiguration(classes = {Api.class})
public abstract class ViotualizeApiTest extends AbstractTestNGSpringContextTests {

    private final static String ENDPOINT_ADDRESS = "http://localhost";

    @Autowired
    private ApplicationContext context;

    private static Server server;

    protected static int port;

    @BeforeClass
    @Rollback(false)
    public void initialize() throws Exception {
        assertNotNull(context);
        if (server == null || !server.isStarted()) {
            startServer();
        }

        assertTrue(server.isStarted());
        RestAssured.port = ViotualizeApiTest.port;
    }

    @AfterClass
    public static void teardown() throws Exception {
        server.destroy();
    }

    private void startServer() throws Exception {
        JAXRSServerFactoryBean sf = new JAXRSServerFactoryBean();
        sf.setResourceClasses(getServiceBeanClass());

        Object serviceBean = context.getBean(getServiceBeanName(), getServiceBeanClass());
        sf.setServiceBean(serviceBean);

        List<Object> providers = new ArrayList<>();
        providers.add(new JacksonJaxbJsonProvider());
        sf.setProviders(providers);

        List<Feature> features = new ArrayList<>();
        features.add(new LoggingFeature());
        sf.setFeatures(features);

        sf.setResourceProvider(getServiceBeanClass(), new SingletonResourceProvider(serviceBean, true));
        int port = getAvailablePort();
        ViotualizeApiTest.port = port;

        sf.setAddress(ENDPOINT_ADDRESS + ":" + port + "/");
        server = sf.create();
    }

    protected abstract Class getServiceBeanClass();

    protected String getServiceBeanName() {
        return getServiceBeanClass().getSimpleName().toLowerCase();
    }

    protected int getAvailablePort() {
        try (ServerSocket serverSocket = new ServerSocket(0)) {
            return serverSocket.getLocalPort();
        } catch (IOException ignored) {
            throw new RuntimeException("Cannot determine an usable free port"); // todo hmmmm
        }
    }
}
