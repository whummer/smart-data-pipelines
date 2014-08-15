package com.viotualize.catalog.acceptance;

import static com.jayway.restassured.RestAssured.given;
import static org.testng.Assert.assertTrue;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.restassured.filter.log.RequestLoggingFilter;
import com.jayway.restassured.filter.log.ResponseLoggingFilter;
import com.jayway.restassured.http.ContentType;
import com.viotualize.api.services.AbstractServiceTest;
import com.viotualize.catalog.rest.CatalogService;

/**
 * Acceptance test class for the Catalog REST Service. Does not use any domain classes (on
 * purpose) as it want to deal with JSON according to our specification (how our users
 * would call it).
 * 
 * @author riox
 */
public class CatalogServiceTest extends AbstractServiceTest {

	static final Logger log = LoggerFactory.getLogger(CatalogServiceTest.class);
	static final String PATH = "/catalog/entries";

	static String endpoint_url = null;

	@BeforeClass
	public static void init() {
		// port is dynamically assigned in AbstractTestService
		endpoint_url = "http://localhost:" + port + PATH;
	}

	//@Test TODO commented out because I need to change the tests to provision a Eureka as part of it 
	public void testCatalogPOST1() throws IOException, URISyntaxException {
		log.info("Executing testCatalogPOST1() ...");

		String location = given().filter(new ResponseLoggingFilter())
				.filter(new RequestLoggingFilter()).contentType(ContentType.JSON)
				.body(readJsonFromClasspath("/catalog-post1.json")).expect()
				.statusCode(HttpStatus.SC_CREATED).when().post(PATH).andReturn()
				.getHeader("Location");

		assertTrue(location.contains(PATH));
	}

	//@Test // @Test TODO commented out because I need to change the tests to provision a Eureka as part of it 
	public void testCatalogPOST2() throws IOException, URISyntaxException {
		log.info("Executing testCatalogPOST2() ...");

		String location = given().filter(new ResponseLoggingFilter())
				.filter(new RequestLoggingFilter()).contentType(ContentType.JSON)
				.body(readJsonFromClasspath("/catalog-post2.json")).expect()
				.statusCode(HttpStatus.SC_CREATED).when().post(PATH).andReturn()
				.getHeader("Location");

		assertTrue(location.contains(PATH));
	}

	//@Test
	public void testCatalogGET() {

	}

	@Override
	protected Class<?> getServiceBeanClass() {
		return CatalogService.class;
	}

}
