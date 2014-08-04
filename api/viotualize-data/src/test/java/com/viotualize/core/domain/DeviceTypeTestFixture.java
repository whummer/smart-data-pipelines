package com.viotualize.core.domain;

import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.Mongo;
import com.viotualize.core.repositories.DeviceTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @author omoser
 */
@Component
public class DeviceTypeTestFixture {

    @Autowired
    Mongo mongo;

    @Autowired
    DeviceTypeRepository repository;

    List<DeviceType> sensors = new ArrayList<>();

    List<DeviceType> containers = new ArrayList<>();

    public void prepareDeviceTypes() {
        DB database = mongo.getDB("viotualize");
        DBCollection deviceTypes = database.getCollection("device_types");
        deviceTypes.drop();

        DeviceType ultraSoniceSensor = new DeviceType("HC-SR04")
                .withType(DeviceType.Type.SENSOR)
                .withDescription("The HC-SR04 Ultrasonic Range Sensor uses non-contact ultrasound sonar to measure the " +
                        "distance to an object - they're great for any obstacle avoiding systems on Raspberry Pi robots " +
                        "or rovers! The HC-SR04 consists of two ultrasonic transmitters (basically speakers), a receiver, and a control circuit. ")
                .addProperty("input_voltage", "5V")
                .addProperty("current-draw", "20mA")
                .addProperty("sensing-angle", "30°")
                .addProperty("width", "20mm")
                .addProperty("height", "15mm")
                .addProperty("length", "35mm")
                .addProperty("temperature", "-15C..70C");

        DeviceType motionSensor = new DeviceType("HC-SR501")
                .withType(DeviceType.Type.SENSOR)
                .withDescription("This PIR includes an adjustable delay before firing (approx 0.5 - 200 seconds), " +
                        "has adjustable sensitivity and two M2 mounting holes! It runs on 4.5V-20V power (or 3V by " +
                        "bypassing the regulator with a bit of soldering) and has a digital signal output  (3.3V) high, " +
                        "0V low. Its sensing range is up to 7 meters in a 100 degree cone.")
                .addProperty("input_voltage", "4.5V..20V")
                .addProperty("current-draw", "50mA")
                .addProperty("sensing-angle", "100°")
                .addProperty("range", "5m..7m")
                .addProperty("width", "32mm")
                .addProperty("height", "25mm")
                .addProperty("length", "25mm")
                .addProperty("temperature", "-15C..70C");

        DeviceType temperatureSensor = new DeviceType("DS18B20")
                .withType(DeviceType.Type.SENSOR)
                .withDescription("A genuine Maxim sourced DS18B20+ One Wire Digital Temperature Sensor. The DS18B20+ " +
                        "is the perfect low-cost solution for a range of Raspberry Pi and Arduino temperature control " +
                        "and data-logging projects! The DS18B20+ measures temperature in degrees Celsius with 9 to" +
                        " 12-bit precision and includes an alarm function with nonvolatile user-programmable upper" +
                        " and lower trigger points. Sensing range is -55C to 125C (accurate to ±0.5°C over the range " +
                        "of -10°C to +85°C), and each sensor has a unique 64-bit serial number hard-programmed enabling " +
                        "the use of a number of sensors on a single data bus.")
                .addProperty("input_voltage", "3V..5V")
                .addProperty("resolution", "9bit..12bit")
                .addProperty("temperature", "-55C..125C");

        repository.save(ultraSoniceSensor);
        repository.save(motionSensor);
        repository.save(temperatureSensor);

        sensors.add(ultraSoniceSensor);
        sensors.add(motionSensor);
        sensors.add(temperatureSensor);

        DeviceType raspiBPlus = new DeviceType("Raspberry Pi Model B+")
                .withDescription("512MB RAM, new GPIO, microSD")
                .withType(DeviceType.Type.CONTAINER)
                .addChild(motionSensor)
                .addChild(temperatureSensor)
                .addChild(ultraSoniceSensor);

        repository.save(raspiBPlus);

        this.containers.add(raspiBPlus);
    }
}
