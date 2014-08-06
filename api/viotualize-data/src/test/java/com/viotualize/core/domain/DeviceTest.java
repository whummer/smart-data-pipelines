package com.viotualize.core.domain;

import com.viotualize.core.repositories.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * @author omoser
 */
//@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath*:viotualize-mongodb-config-test.xml")
public class DeviceTest extends AbstractTestNGSpringContextTests {

    @Autowired
    DeviceTypeTestFixture deviceTypeTestFixture;

    @Autowired
    DeviceTestFixture deviceTestFixture;

    @Autowired
    DeviceRepository repository;

    @BeforeClass
    public void setup() {
        //deviceTestFixture.prepareDeviceTestData();
    }

    @Test
    public void findDevicesWithinRange() {

    }

}
