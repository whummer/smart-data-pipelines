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

import org.apache.commons.io.FileUtils;
import org.apache.http.HttpStatus;
import org.elasticsearch.client.Client;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.embedded.EmbeddedWebApplicationContext;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.boot.test.WebIntegrationTest;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;

import static com.jayway.restassured.RestAssured.given;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.hamcrest.core.Is.is;
import static org.mockito.Mockito.when;

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
	EmbeddedWebApplicationContext context;

	@Autowired
	ThingTypeRepository thingTypeRepository;

	@Autowired
	ServiceClientFactory clientFactory;

	@Autowired
	DiscoveryClient discoveryClient;

	@Autowired
	Client nodeClient;

	@Value("${basedir}/target/data")
	String dataDirectory;

	CatalogService client;

	@BeforeClass
	public void elasticFixture() throws IOException {
		// remove ES data dir in mvn clean was not called
		FileUtils.deleteDirectory(new File(dataDirectory));

		// please note that we have to set the port here since it is not known in CatalogServiceTestStarter
		InstanceInfo.Builder builder = InstanceInfo.Builder.newBuilder();
		Application catalogService = new Application("catalog-service");
		catalogService.addInstance(builder
						.setHostName("localhost")
						.setIPAddr("127.0.0.1")
						.setPort(port)
						.setAppName("catalog-service")
						.build()
		);

		when(discoveryClient.getApplication("catalog-service")).thenReturn(catalogService);
		client = clientFactory.getCatalogServiceClient();

		// setup a sample thing type
		ThingType ultraSonicSensor = createUltrasonicThingType();
		thingTypeRepository.save(new ThingTypeElastic(ultraSonicSensor));
	}

	@AfterClass
	public void cleanUpDataDir() throws IOException {
		// remove ES data dir in mvn clean was not called
		FileUtils.deleteDirectory(new File(dataDirectory));
	}

	//@Test
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

		//@formatter:on

	}

	@Test
	public void listAllThingsAndQueryForUltrasonicThingType() {
		ThingType ultrasonicThingType = createUltrasonicThingType();
		List<ThingType> thingTypes = client.listThingTypes(null, 0, 100);
		assertThat("list of queried ThingTypes is not empty", thingTypes.isEmpty(), equalTo(false));
		ThingType expected = createUltrasonicThingType();
		ThingType actual = thingTypes.stream().filter(tt ->ultrasonicThingType.getName().equals(tt.name))
				.findFirst()
				.orElse(null);

		assertThat("there is this thingtype", actual, is(notNullValue()));
		expected.setId(actual.getId());
		assertThat("thing from ES and actual thing are identical", actual, samePropertyValuesAs(expected));
	}

	@Test
	public void addNewThingTypeAndQueryForNewThingType() {
		ThingType motionSensor = createMotionSensorThingType();
		ThingType created = client.createThingType(motionSensor);
		motionSensor.setId(created.getId());
		assertThat("the properties of the thing types are identical", motionSensor, samePropertyValuesAs(created));

		List<ThingType> queried = client.listThingTypes("name:" + motionSensor.getName(), 0, 100);
		assertThat("the list of thing types contains the one we created", queried, hasItems(motionSensor));
	}

	ThingType createUltrasonicThingType() {
		return new ThingType("HC-SR04")
				.withImageData(Arrays.asList(new ImageData()
						.withHref("http://fritzing.org/media/fritzing-repo/projects/h/hc-sr04-project/images/HC-SR04-2.jpg")
						.withContentType("image/jpeg")))
				.withDescription("The HC-SR04 Ultrasonic Range Sensor uses non-contact ultrasound sonar to " +
						"measure a the distance to an object - they're great for any obstacle avoiding systems on Raspberry " +
						"Pi robots or rovers! The HC-SR04 consists of two ultrasonic transmitters (basically speakers), a " +
						"receiver, and a control circuit.")
				.addFeature("input_voltage", "5V")
				.addFeature("current-draw", "20mA")
				.addFeature("sensing-angle", "30°")
				.addFeature("width", "20mm")
				.addFeature("height", "15mm")
				.addFeature("length", "35mm")
				.addFeature("temperature", "-15C..70C")
				.addTag("ultrasonic")
				.addTag("raspberry")
				.addProperty(new Property("distance")
						.withPropertyType(PropertyType.DOUBLE)
						.withActuatable(false).withSensable(true)
						.withValueDomain(new ValueDomainContinuous<>(0.0, 200.0)));
	}

	ThingType createMotionSensorThingType() {
		return new ThingType("HC-SR501").withImageData(Arrays.asList(new ImageData()
				.withHref("http://www.linkdelight.com/components/com_virtuemart/shop_image/product/PIR_Sensor_Human_51fb6871f126d.jpg")
				.withContentType("image/jpeg")))
				.withDescription("This PIR includes an adjustable delay before firing (approx 0.5 - 200 seconds), "
						+ "has adjustable sensitivity and two M2 mounting holes! It runs on 4.5V-20V power "
						+ "(or 3V by bypassing the regulator with a bit of soldering) and has a digital signal output"
						+ " (3.3V) high, 0V low. Its sensing range is up to 7 meters in a 100 degree cone.")
				.addFeature("input_voltage", "4.5V..20V")
				.addFeature("current-draw", "50mA")
				.addFeature("sensing-angle", "100°")
				.addFeature("range", "5m..7m")
				.addFeature("width", "32mm")
				.addFeature("height", "25mm")
				.addFeature("length", "25mm")
				.addFeature("temperature", "-15C..70C")
				.addTag("motion")
				.addProperty(new Property("motion")
						.withPropertyType(PropertyType.BOOLEAN)
						.withActuatable(false).withSensable(true)
						.withValueDomain(new ValueDomainEnumerated<>(true, false)));
	}

}
