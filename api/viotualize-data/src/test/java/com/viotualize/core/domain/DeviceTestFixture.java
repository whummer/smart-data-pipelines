package com.viotualize.core.domain;

import com.mongodb.Mongo;
import com.viotualize.core.repositories.DeviceRepository;
import com.viotualize.core.repositories.DeviceTypeRepository;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Random;
import java.util.UUID;

import static org.junit.Assert.assertFalse;

/**
 * @author omoser
 */
@Component
public class DeviceTestFixture {

    @Autowired
    Mongo mongo;

    @Autowired
    DeviceTypeRepository deviceTypeRepository;

    @Autowired
    DeviceTypeTestFixture deviceTypeTestFixture;

    @Autowired
    DeviceRepository deviceRepository;

    @Value("${test.devicefixture.deviceCount:1000}")
    int deviceCount;

    @Value("${test.devicefixture.positionX:48.200418}")
    double positionX;

    @Value("${test.devicefixture.positionY:16.370953}")
    double positionY;

    @Value("${test.devicefixture.radius:1000}")
    int radius;

    Random rand = new Random();

    public void prepareDeviceTestData() {
        deviceTypeTestFixture.prepareDeviceTypes();
        assertFalse(deviceTypeTestFixture.sensors.isEmpty());
        assertFalse(deviceTypeTestFixture.containers.isEmpty());

        for (int i = 0; i < deviceCount; i++) {
            Device d = new Device(UUID.randomUUID().toString());
            DeviceType type;

            // create container device
            if (rand.nextBoolean()) {
                type = deviceTypeTestFixture.containers.get(0);
            } else {
                type = deviceTypeTestFixture.sensors.get(0);
            }

            d.withDeviceType(type).withLocation(getLocation(positionX, positionY, radius));

            deviceRepository.save(d);
        }
    }



   /* public static void main(String[] args) {
        DeviceTestFixture f = new DeviceTestFixture();
        double[] newLocation = f.getLocation(48.200418d, 16.370953d, 1000);
        System.out.println("New location: Long:" + newLocation[0] + ", Lat: " + newLocation[1]);
    }*/


    // http://gis.stackexchange.com/questions/25877/how-to-generate-random-locations-nearby-my-location
    public double[] getLocation(double positionX, double positionY, int radius) {

        // Convert radius from meters to degrees
        double radiusInDegrees = radius / 111000f;

        double u = rand.nextDouble();
        double v = rand.nextDouble();
        double w = radiusInDegrees * Math.sqrt(u);
        double t = 2 * Math.PI * v;
        double x = w * Math.cos(t);
        double y = w * Math.sin(t);

        // Adjust the x-coordinate for the shrinking of the east-west distances
        double new_x = x / Math.cos(positionY);

        double foundLongitude = new_x + positionX;
        double foundLatitude = y + positionY;
        return new double[]{foundLongitude, foundLatitude};
    }

}
