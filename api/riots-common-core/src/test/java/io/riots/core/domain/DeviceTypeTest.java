package io.riots.core.domain;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import io.riots.core.model.DeviceType;
import io.riots.core.repositories.DeviceTypeRepository;

import java.util.List;
import java.util.Set;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.mongodb.Mongo;

/**
 * @author omoser
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(
		locations = "classpath*:riots-mongodb-config-test.xml"
)
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

        DeviceType raspiBPlus = allRaspis.stream().findFirst().get();

        assertEquals("512MB RAM, new GPIO, microSD", raspiBPlus.getDescription());
        Set<DeviceType> childDevices = (Set<DeviceType>)raspiBPlus.getChildren();
        assertNotNull(childDevices);
        assertFalse(childDevices.isEmpty());
    }

}
