package com.viotualize.api.services;

import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.assertTrue;

import java.io.IOException;
import java.io.InputStream;
import java.net.ServerSocket;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.beans.Introspector;

import org.apache.cxf.endpoint.Server;
import org.apache.cxf.feature.Feature;
import org.apache.cxf.feature.LoggingFeature;
import org.apache.cxf.helpers.IOUtils;
import org.apache.cxf.jaxrs.JAXRSServerFactoryBean;
import org.apache.cxf.jaxrs.lifecycle.SingletonResourceProvider;
import org.apache.tomcat.util.http.fileupload.util.Streams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeSuite;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.jaxrs.json.JacksonJaxbJsonProvider;
import com.jayway.restassured.RestAssured;
import com.viotualize.boot.ServiceStarter;

/**
 * @author omoser
 */
@ContextConfiguration(classes = { ServiceStarter.class })
public abstract class AbstractServiceTest extends
		AbstractTestNGSpringContextTests {

	private final static String ENDPOINT_ADDRESS = "http://localhost";

	@Autowired
	private ApplicationContext context;
	
//	private MockRemoteEurekaServer eurekaServer = new MockRemoteEurekaServer();

	private static Server server;

	protected static int port;
	
//	@BeforeSuite
//	public void startEureka() throws Exception {
//		eurekaServer.start();
//	}
//	
//	@AfterSuite
//	public void stopEureka() throws Exception {
//		eurekaServer.stop();
//	}

	@BeforeClass
	@Rollback(false)
	public void initialize() throws Exception {
		assertNotNull(context);
		if (server == null || !server.isStarted()) {
			startServer();
		}

		assertTrue(server.isStarted());
		RestAssured.port = AbstractServiceTest.port;
	}

	@AfterClass
	public static void teardown() throws Exception {
		server.destroy();
	}

	private void startServer() throws Exception {
		JAXRSServerFactoryBean sf = new JAXRSServerFactoryBean();		
		sf.setResourceClasses(getServiceBeanClass());

		Object serviceBean = context.getBean(getServiceBeanName(),
				getServiceBeanClass());
		sf.setServiceBean(serviceBean);

		List<Object> providers = new ArrayList<>();
		providers.add(new JacksonJaxbJsonProvider());
		sf.setProviders(providers);

		List<Feature> features = new ArrayList<>();
		features.add(new LoggingFeature());
		sf.setFeatures(features);

		sf.setResourceProvider(getServiceBeanClass(),
				new SingletonResourceProvider(serviceBean, true));
		int port = getAvailablePort();
		AbstractServiceTest.port = port;

		sf.setAddress(ENDPOINT_ADDRESS + ":" + port + "/");
		server = sf.create();
	}

	protected abstract Class<?> getServiceBeanClass();

	/**
	 * By default converts "CatalogService" to be converted to "catalogService".
	 * @return the camelCase string representation
	 */
	protected String getServiceBeanName() { 
		return Introspector.decapitalize(getServiceBeanClass().getSimpleName());
  }

	protected int getAvailablePort() {
		try (ServerSocket serverSocket = new ServerSocket(0)) {
			return serverSocket.getLocalPort();
		} catch (IOException ignored) {
			throw new RuntimeException("Cannot determine an usable free port"); // todo hmmmm
		}
	}

	protected HttpEntity<String> createJsonHttpRequest(JsonNode rootNode) {
		// create headers
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
	
		HttpEntity<String> request = new HttpEntity<String>(rootNode.toString(),
				headers);
		return request;
	}

	protected JsonNode createJsonNode(String jsonClasspathResource) throws IOException,
			URISyntaxException, JsonProcessingException {
				ObjectMapper objectMapper = new ObjectMapper();
				return objectMapper.readTree(readJsonFromClasspath(jsonClasspathResource));
			}

	protected byte[] readJsonFromClasspath(String jsonClasspathResource) throws IOException,
			URISyntaxException {
				InputStream is = getClass().getResourceAsStream( jsonClasspathResource );
				return IOUtils.readBytesFromStream(is);
			}

}
