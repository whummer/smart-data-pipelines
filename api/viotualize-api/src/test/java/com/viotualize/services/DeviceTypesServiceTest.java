package com.viotualize.services;

import static com.jayway.restassured.RestAssured.given;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import java.io.IOException;

import org.apache.http.HttpStatus;
import org.springframework.test.context.ContextConfiguration;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.restassured.filter.log.RequestLoggingFilter;
import com.jayway.restassured.filter.log.ResponseLoggingFilter;
import com.jayway.restassured.http.ContentType;
import com.viotualize.api.Api;
import com.viotualize.api.services.AbstractServiceTest;
import com.viotualize.api.services.DeviceTypes;
import com.viotualize.core.domain.DeviceType;

/**
 * @author omoser
 * @author riox
 */

@ContextConfiguration(classes = {Api.class})
public class DeviceTypesServiceTest extends AbstractServiceTest {

    public static final String DEVICE_TYPES_PATH = "/device-types";
    ObjectMapper mapper = new ObjectMapper();

    String location;

    DeviceType original;

    DeviceType fromJson;

    @BeforeClass
    public void setup() {
        original = new DeviceType("BeagleBone Black")
                .withType(DeviceType.Type.CONTAINER)
                .withDescription("BeagleBone Black is a low-cost, community-supported development platform for " +
                        "developers and hobbyists. Boot Linux in under 10 seconds and get started on development " +
                        "in less than 5 minutes with just a single USB cable.")
                .addProperty("cpu", "AM335x 1GHz ARM Cortex-A8")
                .addProperty("ram", "512MB DDR3 RAM")
                .addProperty("usb", "USB client for power & communications");        
    }

    //@Test(groups = {"API"})
    @Test()
    //@formatter:off
    public void createDeviceType() throws IOException {
        // create the device
        location =
        given()
            .filter(new ResponseLoggingFilter())
            .filter(new RequestLoggingFilter())
        .contentType(ContentType.JSON)
            .body(original)
        .expect()
            .statusCode(HttpStatus.SC_CREATED)
        .when()
            .post(DEVICE_TYPES_PATH)
        .andReturn()
            .getHeader("Location");

        assertTrue(location.contains(DEVICE_TYPES_PATH));

    }

    //@Test(groups = {"API"}, dependsOnMethods = {"createDeviceType"})
    @Test(dependsOnMethods = {"createDeviceType"})
    public void retrieveDeviceType() throws IOException {
        // retrieve the device
        String json = readDeviceFromApi(HttpStatus.SC_OK, ContentType.JSON.toString());

        fromJson = mapper.reader(DeviceType.class).readValue(json);
        original.setId(fromJson.getId());
        assertEquals(original, fromJson);
        assertEquals(original.getProperties(), fromJson.getProperties());
    }


    //@Test(groups = {"API"}, dependsOnMethods = {"retrieveDeviceType"})
    @Test(dependsOnMethods = {"retrieveDeviceType"})
    public void updateDeviceType() throws IOException {

        fromJson.setName("BeagleBone White");
        original.setName(fromJson.getName());

        given()
            .filter(new ResponseLoggingFilter())
            .filter(new RequestLoggingFilter())
            .contentType(ContentType.JSON)
            .body(fromJson)
        .expect()
            .statusCode(HttpStatus.SC_OK)
        .when()
            .put(DEVICE_TYPES_PATH);

        String json = readDeviceFromApi(HttpStatus.SC_OK, ContentType.JSON.toString());
        System.out.println(json);
        fromJson = mapper.reader(DeviceType.class).readValue(json);

        assertEquals(original, fromJson);
        assertEquals(original.getProperties(), fromJson.getProperties());
    }

    @Test(dependsOnMethods = {"updateDeviceType"})
    public void deleteDeviceType() {
        given()
            .filter(new ResponseLoggingFilter())
            .filter(new RequestLoggingFilter())
        .expect()
            .statusCode(HttpStatus.SC_OK)
        .when()
            .delete(location);

    }

    @Test(dependsOnMethods = {"deleteDeviceType"})
    public void failRetrieveOnDeletedDeviceType() {
        readDeviceFromApi(HttpStatus.SC_NOT_FOUND, ""); // no content type for 404's
    }

    private String readDeviceFromApi(int statusCode, String contentType) {
        return  given()
                    .filter(new ResponseLoggingFilter())
                    .filter(new RequestLoggingFilter())
                .expect()
                    .statusCode(statusCode)
                    .contentType(contentType)
                .when()
                    .get(location)
                .andReturn()
                    .asString();
    }


    @Override
    protected Class<?> getServiceBeanClass() {
        return DeviceTypes.class;
    }

}
