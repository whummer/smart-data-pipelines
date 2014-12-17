package io.riots.api.services;

import static com.jayway.restassured.RestAssured.given;
import static org.junit.Assert.assertEquals;
import io.riots.core.auth.AuthFilter;
import io.riots.core.model.DeviceType;

import java.io.IOException;

import org.apache.http.HttpStatus;
import org.junit.BeforeClass;
import org.junit.Test;
import org.springframework.test.context.ContextConfiguration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.restassured.filter.log.RequestLoggingFilter;
import com.jayway.restassured.filter.log.ResponseLoggingFilter;
import com.jayway.restassured.http.ContentType;

/**
 * @author omoser
 */

//@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration({"classpath*:riots-api.xml"})
public class DeviceTypesServiceTest extends AbstractServiceTest {

    ObjectMapper mapper = new ObjectMapper();

    @BeforeClass
    public void setup() {
    	AuthFilter.TESTING_DISABLE_AUTH = true;
    }

    @Test
    //@formatter:off
    public void crudDeviceType() throws IOException {
        DeviceType deviceType = new DeviceType("BeagleBone Black")
                .withDescription("BeagleBone Black is a low-cost, community-supported development platform for " +
                        "developers and hobbyists. Boot Linux in under 10 seconds and get started on development " +
                        "in less than 5 minutes with just a single USB cable.")
                .addProperty("cpu", "AM335x 1GHz ARM Cortex-A8")
                .addProperty("ram", "512MB DDR3 RAM")
                .addProperty("usb", "USB client for power & communications");

        String location =
        given()
            .filter(new ResponseLoggingFilter())
            .filter(new RequestLoggingFilter())
            .contentType(ContentType.JSON)
            .body(deviceType)
        .expect()
            .statusCode(HttpStatus.SC_CREATED)
        .when()
            .post("/device-types")
        .andReturn()
            .getHeader("Location");

        String json =
        given()
            .filter(new ResponseLoggingFilter())
            .filter(new RequestLoggingFilter())
        .expect()
            .statusCode(HttpStatus.SC_OK)
            .contentType(ContentType.JSON)
        .when()
            .get(location)
        .andReturn()
            .asString();

        DeviceType fromJson = mapper.reader(DeviceType.class).readValue(json);

        // assertEquals(deviceType, fromJson) won't work since there's no ID in the original pojo
        assertEquals(deviceType.getName(), fromJson.getName());
        assertEquals(deviceType.getDescription(), fromJson.getDescription());
        assertEquals(deviceType.getCreated(), fromJson.getCreated());

    }

    @Override
    protected Class<?> getServiceBeanClass() {
        return DeviceTypes.class;
    }

    @Override
    protected String getServiceBeanName() {
        return "deviceTypes";
    }
}
