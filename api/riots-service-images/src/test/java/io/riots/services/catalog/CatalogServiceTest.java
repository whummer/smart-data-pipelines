package io.riots.services.catalog;

import static com.jayway.restassured.RestAssured.given;
import static org.testng.Assert.assertTrue;
import io.riots.api.services.AbstractServiceTest;
import io.riots.services.catalog.api.ImageService;

import java.io.IOException;
import java.net.URISyntaxException;

import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.annotations.BeforeClass;

import com.jayway.restassured.filter.log.RequestLoggingFilter;
import com.jayway.restassured.filter.log.ResponseLoggingFilter;
import com.jayway.restassured.http.ContentType;

/**
 * Acceptance test class for the Catalog REST Service. Does not use any model classes (on
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
		return ImageService.class;
	}

}
