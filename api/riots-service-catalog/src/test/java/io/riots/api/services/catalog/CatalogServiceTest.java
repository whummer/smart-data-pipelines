package io.riots.api.services.catalog;

import com.jayway.restassured.filter.log.RequestLoggingFilter;
import com.jayway.restassured.filter.log.ResponseLoggingFilter;
import com.jayway.restassured.http.ContentType;
import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.DiscoveryClient;
import com.netflix.discovery.shared.Application;
import io.riots.api.services.catalog.model.ThingTypeElastic;
import io.riots.boot.starters.CatalogServiceTestStarter;
import io.riots.core.clients.ServiceClientFactory;
import io.riots.core.repositories.ThingTypeRepository;
import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.embedded.EmbeddedWebApplicationContext;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.boot.test.WebIntegrationTest;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;

import static com.jayway.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.mockito.Mockito.when;
import static org.springframework.test.util.MatcherAssertionErrors.assertThat;

/**
 * @author omoser
 */
@SpringApplicationConfiguration(classes = {CatalogServiceTestStarter.class})
@WebIntegrationTest("server.port:0")
public class CatalogServiceTest extends AbstractTestNGSpringContextTests {

	static final Logger log = LoggerFactory.getLogger(CatalogServiceTest.class);

	static final String THING_TYPES_PATH = "/api/v1/catalog/thing-types";

	@Value("${local.server.port}")
	int port;

	@Value("http://localhost:${local.server.port}" + THING_TYPES_PATH)
	String endpoint;

	@Autowired
	EmbeddedWebApplicationContext server;

	@Autowired
	ThingTypeRepository thingTypeRepository;

	@Autowired
	ServiceClientFactory clientFactory;

	@Autowired
	DiscoveryClient discoveryClient;

	@BeforeClass
	public void elasticFixture() {

		// please note that we have to set the port here since it is not known in CatalogServiceTestStarter
		InstanceInfo.Builder builder = InstanceInfo.Builder.newBuilder();
		Application catalogService = new Application("catalog-service");
		catalogService.addInstance(builder.setHostName("localhost").setPort(port).setAppName("catalog-service").build());
		when(discoveryClient.getApplication("catalog-service")).thenReturn(catalogService);

		// setup a sample thing type
		ThingType ultraSonicSensor = new ThingType("HC-SR04");
		ultraSonicSensor.withImageData(Arrays.asList(
				new ImageData()
						.withHref("http://fritzing.org/media/fritzing-repo/projects/h/hc-sr04-project/images/HC-SR04-2.jpg")
						.withContentType("image/jpg")));

		ultraSonicSensor.setDescription(
				"The HC-SR04 Ultrasonic Range Sensor uses non-contact ultrasound sonar to measure the "
						+ "distance to an object - they're great for any obstacle avoiding systems on Raspberry Pi robots "
						+ "or rovers! The HC-SR04 consists of two ultrasonic transmitters (basically speakers), a receiver, and a control circuit.");
		ultraSonicSensor.addFeature("input_voltage", "5V");
		ultraSonicSensor.addFeature("current-draw", "20mA");
		ultraSonicSensor.addFeature("sensing-angle", "30°");
		ultraSonicSensor.addFeature("width", "20mm");
		ultraSonicSensor.addFeature("height", "15mm");
		ultraSonicSensor.addFeature("length", "35mm");
		ultraSonicSensor.addFeature("temperature", "-15C..70C");
		ultraSonicSensor.addTag("ultrasonic");
		ultraSonicSensor.addTag("raspberry");
		Property propDist = new Property("distance");
		propDist.setPropertyType(PropertyType.DOUBLE);
		propDist.setActuatable(false).setSensable(true);
		propDist.setValueDomain(new ValueDomainContinuous<>(0.0, 200.0));
		ultraSonicSensor.getProperties().add(propDist);

		thingTypeRepository.save(new ThingTypeElastic(ultraSonicSensor));
	}

	@Test
	public void checkSingleItemUsingPlainRest() throws IOException, URISyntaxException {
		log.info("Got port {}. Executing ping against catalog using URL: {}", port, endpoint);

		//@formatter:off
		given()
			.filter(new ResponseLoggingFilter())
			.filter(new RequestLoggingFilter())
			.contentType(ContentType.JSON)
		.expect()
			.statusCode(HttpStatus.SC_OK)
			.body("[0].name", equalTo("HC-SR04"))
		.when()
			.get(endpoint)
		.andReturn()
			.getHeader("Location");

	}

	@Test
	public void checkSingleItemUsingServiceClient() {
		CatalogService client = clientFactory.getCatalogServiceClient();
		List<? extends ThingType> thingTypes = client.listThingTypes(null, 0, 100);
		assertThat("contains single ThingType HC-SR04", thingTypes.size(), equalTo(1));
	}

}
