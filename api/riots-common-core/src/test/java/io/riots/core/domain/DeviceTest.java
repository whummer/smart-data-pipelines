package io.riots.core.domain;

import io.riots.core.repositories.DeviceRepository;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author omoser
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath*:riots-mongodb-config-test.xml")
public class DeviceTest {

    @Autowired
    DeviceTypeTestFixture deviceTypeTestFixture;

    @Autowired
    DeviceTestFixture deviceTestFixture;

    @Autowired
    DeviceRepository repository;

    @Before
    public void setup() {
        //deviceTestFixture.prepareDeviceTestData();
    }

    @Test
    public void findDevicesWithinRange() {

    }

}
