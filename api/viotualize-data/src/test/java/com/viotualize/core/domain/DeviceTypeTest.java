package com.viotualize.core.domain;

import com.mongodb.Mongo;
import com.viotualize.core.repositories.DeviceTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.util.List;
import java.util.Set;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNotNull;
import static org.testng.AssertJUnit.assertFalse;


/**
 * @author omoser
 */
@ContextConfiguration(locations = "classpath*:viotualize-mongodb-config-test.xml")
public class DeviceTypeTest extends AbstractTestNGSpringContextTests {

    @Autowired
    Mongo mongo;

    @Autowired
    DeviceTypeRepository repository;

    @Autowired
    DeviceTypeTestFixture fixture;


    @BeforeClass()
    public void setUp() {
        fixture.prepareDeviceTypes();
    }

    @AfterClass
    public void tearDown() {

    }

    @Test
    public void loadDeviceTypeByName() {
        List<DeviceType> allRaspis = repository.findByNameLike("Raspberry");

        DeviceType raspiBPlus = allRaspis.stream().filter(d -> d.getType() == DeviceType.Type.CONTAINER).findFirst().get();

        assertEquals("512MB RAM, new GPIO, microSD", raspiBPlus.getDescription());
        assertEquals(DeviceType.Type.CONTAINER, raspiBPlus.getType());
		Set<DeviceType> childDevices = (Set<DeviceType>)raspiBPlus.getChildren();
        assertNotNull(childDevices);
        assertFalse(childDevices.isEmpty());
    }

    @Test
    public void findDeviceTypeByType() {
        List<DeviceType> sensors = repository.findByType(DeviceType.Type.SENSOR);
        assertEquals(fixture.sensors.size(), sensors.size());
        DeviceType hcSensor = sensors.stream().filter(d -> d.name.equals("HC-SR04")).findFirst().get();
        assertEquals("HC-SR04", hcSensor.getName());
    }
}
