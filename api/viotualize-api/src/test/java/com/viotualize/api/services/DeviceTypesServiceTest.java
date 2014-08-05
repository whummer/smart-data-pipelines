package com.viotualize.api.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.restassured.filter.log.RequestLoggingFilter;
import com.jayway.restassured.filter.log.ResponseLoggingFilter;
import com.jayway.restassured.http.ContentType;
import com.viotualize.core.domain.DeviceType;
import org.apache.http.HttpStatus;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.io.IOException;

import static com.jayway.restassured.RestAssured.given;
import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * @author omoser
 */

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration({"classpath*:viotualize-api.xml"})
public class DeviceTypesServiceTest extends ViotualizeApiTest {

    ObjectMapper mapper = new ObjectMapper();

    @Test
    //@formatter:off
    public void crudDeviceType() throws IOException {
        DeviceType deviceType = new DeviceType("BeagleBone Black")
                .withType(DeviceType.Type.CONTAINER)
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
        assertEquals(deviceType.getType(), fromJson.getType());
        assertEquals(deviceType.getProperties(), fromJson.getProperties());



    }

    @Override
    protected Class getServiceBeanClass() {
        return DeviceTypes.class;
    }

    @Override
    protected String getServiceBeanName() {
        return "deviceTypes";
    }
}
