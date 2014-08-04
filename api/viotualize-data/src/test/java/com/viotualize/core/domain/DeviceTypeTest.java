package com.viotualize.core.domain;

import com.mongodb.Mongo;
import com.viotualize.core.repositories.DeviceTypeRepository;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

/**
 * @author omoser
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath*:viotualize-mongodb-config-test.xml")
public class DeviceTypeTest {

    @Autowired
    Mongo mongo;

    @Autowired
    DeviceTypeRepository repository;

    @Autowired
    DeviceTypeTestFixture fixture;

    @Before
    public void setUp() {
        fixture.prepareDeviceTypes();
    }

    @After
    public void tearDown() {

    }

    @Test
    public void loadDeviceTypeByName() {
        List<DeviceType> allRaspis = repository.findByNameLike("Raspberry");

        DeviceType raspiBPlus = allRaspis.stream().filter(d -> d.getType() == DeviceType.Type.CONTAINER).findFirst().get();

        assertEquals("512MB RAM, new GPIO, microSD", raspiBPlus.getDescription());
        assertEquals(DeviceType.Type.CONTAINER, raspiBPlus.getType());
        Set<DeviceType> childDevices = raspiBPlus.getChildren();
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
