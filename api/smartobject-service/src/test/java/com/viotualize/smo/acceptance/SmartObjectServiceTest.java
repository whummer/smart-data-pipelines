package com.viotualize.smo.acceptance;

import static com.jayway.restassured.RestAssured.given;
import static org.testng.Assert.assertTrue;

import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;

import org.apache.cxf.helpers.IOUtils;
import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.jayway.restassured.filter.log.RequestLoggingFilter;
import com.jayway.restassured.filter.log.ResponseLoggingFilter;
import com.jayway.restassured.http.ContentType;
import com.viotualize.api.services.AbstractServiceTest;
import com.viotualize.smo.api.SmartObjectJsonTest;
import com.viotualize.smo.rest.SmartObjectService;

/**
 * Acceptance test class for the SmartObject REST Service. Does not use any domain classes (on
 * purpose) as it want to deal with JSON according to our specification (how our users
 * would call it).
 * 
 * @author riox
 */
public class SmartObjectServiceTest extends AbstractServiceTest {

	static final Logger log = LoggerFactory.getLogger(SmartObjectServiceTest.class);
	static final String PATH = "/smartobjects";

	static String endpoint_url = null;

	@BeforeClass
	public static void init() {
		// port is dynamically assigned in AbstractTestService
		endpoint_url = "http://localhost:" + port + PATH;
		
		
	}	

	@Test
	public void testSmartObjectPOST1() throws IOException, URISyntaxException {
		log.info("Executing testSmartObjectPOST1() ...");

		String location = given().filter(new ResponseLoggingFilter())
				.filter(new RequestLoggingFilter()).contentType(ContentType.JSON)
				.body( readResourceFromSmartObjectClasspath("/smartobject-example2.json") ).expect()
				.statusCode(HttpStatus.SC_CREATED).when().post(PATH).andReturn()
				.getHeader("Location");

		assertTrue(location.contains(PATH));
	}

	@Test
	public void testSmartObjectPOST2() throws IOException, URISyntaxException {
		log.info("Executing testSmartObjectPOST2() ...");

		log.info("SAUUUU: " + IOUtils.readBytesFromStream(SmartObjectJsonTest.class.getResourceAsStream( "/smartobject-example2.json" )));
		
		String location = given().filter(new ResponseLoggingFilter())
				.filter(new RequestLoggingFilter()).contentType(ContentType.JSON)
				.body( readResourceFromSmartObjectClasspath("/smartobject-example2.json") ).expect()
				.statusCode(HttpStatus.SC_CREATED).when().post(PATH).andReturn()
				.getHeader("Location");

		assertTrue(location.contains(PATH));
	}

	protected byte[] readResourceFromSmartObjectClasspath(String resource) throws IOException {
		return IOUtils.readBytesFromStream(SmartObjectJsonTest.class.getResourceAsStream( resource ));
	}
	
	@Override
	protected Class<?> getServiceBeanClass() {
		return SmartObjectService.class;
	}

}
