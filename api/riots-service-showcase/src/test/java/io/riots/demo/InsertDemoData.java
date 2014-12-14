package io.riots.demo;

import com.mongodb.Mongo;
import io.riots.api.services.ServicesStarter;
import io.riots.core.model.*;
import io.riots.core.repositories.BaseObjectCategorizedRepository;
import io.riots.core.repositories.DeviceTypeRepository;
import io.riots.core.util.cascade.CascadingMongoEventListener;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.testng.Assert;

import javax.servlet.http.HttpServletRequest;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Created by omoser on 13/12/14.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {ServicesStarter.class})
@Configuration
public class InsertDemoData {

    @Bean
    public HttpServletRequest getServletRequest() {
        return new MockHttpServletRequest();
    }

    @Bean
    public Mongo getMongo() throws UnknownHostException {
        return new Mongo();
    }

    @Bean
    public CascadingMongoEventListener getCascadingMongoEventListener() {
        return new CascadingMongoEventListener();
    }

    @Autowired
    DeviceTypeRepository deviceTypeRepository;

    @Autowired
    BaseObjectCategorizedRepository baseObjectCategorizedRepository;

    @Test
    public void testInsertDemoData() {
        Assert.assertNotNull(deviceTypeRepository);
        Assert.assertNotNull(baseObjectCategorizedRepository);
    }

    @Test
    public void insertData() {
        insertPropData();
        insertDevData();
        insertManufacturerData();
        insertDeviceData();
    }

    // OLD CODE from here on

    private Map<String, SemanticType.SemanticPropertyType> propTypes = new HashMap<>();
    private Map<String, SemanticType.SemanticDeviceType> devTypes = new HashMap<>();

    private void insertDeviceData() {
        for (DeviceType t : getDeviceData()) {
            List<DeviceType> types = deviceTypeRepository.findByNameLike(t.getName());
            if (types.isEmpty()) {
                deviceTypeRepository.save(t);
            }
        }
    }

    @SuppressWarnings("all")
    private void insertManufacturerData() {
        for (Manufacturer t : getManufacturers()) {
            List<?> types = baseObjectCategorizedRepository.findByCategoryAndName(t.getCategory(), t.getName());
            if (types.isEmpty()) {
                t = (Manufacturer) baseObjectCategorizedRepository.save(t);
            }
        }
    }

    @SuppressWarnings("all")
    private void insertPropData() {
        insertData(getPropTypes());
    }

    @SuppressWarnings("all")
    private void insertDevData() {
        insertData(getDevTypes());
    }

    @SuppressWarnings("all")
    private void insertData(List<SemanticType> list) {
        for (SemanticType t : list) {
            List<SemanticType> types = baseObjectCategorizedRepository.findByCategoryAndName(t.getCategory(), t.getName());
            if (types.isEmpty()) {
                t = (SemanticType) baseObjectCategorizedRepository.save(t);
                if (t instanceof SemanticType.SemanticPropertyType)
                    propTypes.put(t.getName(), (SemanticType.SemanticPropertyType) t);
                if (t instanceof SemanticType.SemanticDeviceType)
                    devTypes.put(t.getName(), (SemanticType.SemanticDeviceType) t);
            }
        }
    }

    public List<SemanticType> getPropTypes() {
        List<SemanticType> list = new LinkedList<>();
        for (SemanticType.SemanticPropertyType.PredefinedPropTypes t : SemanticType.SemanticPropertyType.PredefinedPropTypes.values()) {
            list.add(new SemanticType.SemanticPropertyType(t.name()));
        }
        return list;
    }

    public List<SemanticType> getDevTypes() {
        List<SemanticType> list = new LinkedList<>();
        for (SemanticType.SemanticDeviceType.PredefinedDevTypes t : SemanticType.SemanticDeviceType.PredefinedDevTypes.values()) {
            list.add(new SemanticType.SemanticDeviceType(t.name()));
        }
        return list;
    }

    public List<Manufacturer> getManufacturers() {
        List<Manufacturer> list = new LinkedList<>();
        list.add(new Manufacturer("_unknown_"));
        list.add(new Manufacturer("A&D Engineering"));
        list.add(new Manufacturer("Arduino"));
        list.add(new Manufacturer("Biospace"));
        list.add(new Manufacturer("Garmin"));
        list.add(new Manufacturer("Honeywell"));
        list.add(new Manufacturer("Interlink Electronics"));
        list.add(new Manufacturer("Kamstrup"));
        list.add(new Manufacturer("Keithley"));
        list.add(new Manufacturer("Philips"));
        list.add(new Manufacturer("Polar"));
        list.add(new Manufacturer("Siemens"));
        list.add(new Manufacturer("SparkFun Electronics"));
        list.add(new Manufacturer("Texas Instruments"));
        list.add(new Manufacturer("Tinkerforge"));
        return list;
    }

    public List<DeviceType> getDeviceData() {

        List<DeviceType> result = new LinkedList<>();

        DeviceType ultraSoniceSensor = new DeviceType("HC-SR04")
                .withDescription(
                        "The HC-SR04 Ultrasonic Range Sensor uses non-contact ultrasound sonar to measure the "
                                + "distance to an object - they're great for any obstacle avoiding systems on Raspberry Pi robots "
                                + "or rovers! The HC-SR04 consists of two ultrasonic transmitters (basically speakers), a receiver, and a control circuit. ")
                .addProperty("input_voltage", "5V")
                .addProperty("current-draw", "20mA")
                .addProperty("sensing-angle", "30°")
                .addProperty("width", "20mm").addProperty("height", "15mm")
                .addProperty("length", "35mm")
                .addProperty("temperature", "-15C..70C");
        Property.PropertyDouble propDist = new Property.PropertyDouble("distance");
        propDist.getMetadata().setActuatable(false).setSensable(true);
        propDist.setValueDomain(new ValueDomainContinuous<Double>(0.0, 200.0));
        ultraSoniceSensor.getDeviceProperties().add(propDist);

        DeviceType motionSensor = new DeviceType("HC-SR501")
                .withDescription(
                        "This PIR includes an adjustable delay before firing (approx 0.5 - 200 seconds), "
                                + "has adjustable sensitivity and two M2 mounting holes! It runs on 4.5V-20V power (or 3V by "
                                + "bypassing the regulator with a bit of soldering) and has a digital signal output  (3.3V) high, "
                                + "0V low. Its sensing range is up to 7 meters in a 100 degree cone.")
                .addProperty("input_voltage", "4.5V..20V")
                .addProperty("current-draw", "50mA")
                .addProperty("sensing-angle", "100°")
                .addProperty("range", "5m..7m").addProperty("width", "32mm")
                .addProperty("height", "25mm").addProperty("length", "25mm")
                .addProperty("temperature", "-15C..70C");
        Property.PropertyBoolean propMotion = new Property.PropertyBoolean("motion");
        propMotion.getMetadata().setActuatable(false).setSensable(true);
        propMotion.setValueDomain(new ValueDomainEnumerated<Boolean>(true, false));
        motionSensor.getDeviceProperties().add(propMotion);

        DeviceType temperatureSensor = new DeviceType("DS18B20")
                .withDescription(
                        "A genuine Maxim sourced DS18B20+ One Wire Digital Temperature Sensor. The DS18B20+ "
                                + "is the perfect low-cost solution for a range of Raspberry Pi and Arduino temperature control "
                                + "and data-logging projects! The DS18B20+ measures temperature in degrees Celsius with 9 to"
                                + " 12-bit precision and includes an alarm function with nonvolatile user-programmable upper"
                                + " and lower trigger points. Sensing range is -55C to 125C (accurate to ±0.5°C over the range "
                                + "of -10°C to +85°C), and each sensor has a unique 64-bit serial number hard-programmed enabling "
                                + "the use of a number of sensors on a single data bus.")
                .addProperty("input_voltage", "3V..5V")
                .addProperty("resolution", "9bit..12bit")
                .addProperty("temperature", "-55C..125C");
        Property.PropertyDouble propTemp = new Property.PropertyDouble("temperature");
        propTemp.setSemanticType(propTypes.get(SemanticType.SemanticPropertyType.PredefinedPropTypes.temperature.toString()));
        propTemp.setValueDomain(new ValueDomainDiscrete<>(-15.0, 70.0, 0.1));
        propTemp.getMetadata().setActuatable(false).setSensable(true);
        temperatureSensor.getDeviceProperties().add(propTemp);

        DeviceType raspiBPlus = new DeviceType("Raspberry Pi Model B+")
                .withDescription("512MB RAM, new GPIO, microSD")
                .addChild(motionSensor)
                .addChild(temperatureSensor).addChild(ultraSoniceSensor);
        Property.PropertyLong propGPU = new Property.PropertyLong("GPU_MEM");
        propGPU.setValueDomain(new ValueDomainDiscrete<>(16L, 448L, 1L));
        propGPU.getMetadata().setActuatable(true).setSensable(true);
        raspiBPlus.getDeviceProperties().add(propGPU);
        Property.PropertyLong propSDTV = new Property.PropertyLong("SDTV_MODE");
        propSDTV.setValueDomain(new ValueDomainEnumerated<Long>(0L, 1L, 2L, 3L));
        propSDTV.getMetadata().setActuatable(true).setSensable(true);
        raspiBPlus.getDeviceProperties().add(propSDTV);
        Property.PropertyLong propHDMI = new Property.PropertyLong("HDMI_MODE");
        propHDMI.setValueDomain(new ValueDomainDiscrete<Long>(0L, 59L, 1L));
        propHDMI.getMetadata().setActuatable(true).setSensable(true);
        raspiBPlus.getDeviceProperties().add(propHDMI);
        Property.PropertyLong propFB = new Property.PropertyLong("FRAMEBUFFER_DEPTH");
        propFB.setValueDomain(new ValueDomainEnumerated<Long>(8L, 16L, 24L, 32L));
        propFB.getMetadata().setActuatable(true).setSensable(true);
        raspiBPlus.getDeviceProperties().add(propFB);

        DeviceType ismartSensor = new DeviceType("iSmart Alarm")
                .withDescription("Wireless motion detector");
        Property.PropertyBoolean propMotion1 = new Property.PropertyBoolean("motion");
        propMotion1.getMetadata().setActuatable(false).setSensable(true);
        propMotion1.setValueDomain(new ValueDomainEnumerated<Boolean>(true, false));
        ismartSensor.getDeviceProperties().add(propMotion1);

        DeviceType waterSensor = new DeviceType("AQUAlogger 210PTdeep")
                .withDescription("Deep water data logger that measures "
                        + "and records temperature and pressure");
        Property.PropertyDouble propPressure = new Property.PropertyDouble("pressure");
        propPressure.setValueDomain(new ValueDomainDiscrete<>(0.0, 100.0, 0.01));
        propPressure.getMetadata().setActuatable(true).setSensable(true);
        propPressure.setSemanticType(propTypes.get(SemanticType.SemanticPropertyType.PredefinedPropTypes.pressure.toString()));
        waterSensor.getDeviceProperties().add(propPressure);
        Property.PropertyDouble propTemp1 = new Property.PropertyDouble("temperature");
        propTemp1.setValueDomain(new ValueDomainDiscrete<>(-2.0, 30.0, 0.05));
        propTemp1.getMetadata().setActuatable(true).setSensable(true);
        propTemp1.setSemanticType(propTypes.get(SemanticType.SemanticPropertyType.PredefinedPropTypes.temperature.toString()));
        waterSensor.getDeviceProperties().add(propTemp1);

        DeviceType gyroSensor = new DeviceType("MPU-6000 Six Axis Motion Tracker")
                .withDescription("Motion tracking device which is a combination of a "
                        + "3-axis gyroscope and a 3-axis accelerometer "
                        + "with an onboard Digital Motion Processor™, "
                        + "which can also access other external sensors");
        Property.PropertyDouble propXAccel = new Property.PropertyDouble("X_ACCEL");
        propXAccel.getMetadata().setActuatable(false).setSensable(true);
        gyroSensor.getDeviceProperties().add(propXAccel);
        Property.PropertyDouble propYAccel = new Property.PropertyDouble("Y_ACCEL");
        propYAccel.getMetadata().setActuatable(false).setSensable(true);
        gyroSensor.getDeviceProperties().add(propYAccel);
        Property.PropertyDouble propZAccel = new Property.PropertyDouble("Z_ACCEL");
        propZAccel.getMetadata().setActuatable(false).setSensable(true);
        gyroSensor.getDeviceProperties().add(propZAccel);
        Property.PropertyDouble propXGyro = new Property.PropertyDouble("X_GYRO");
        propXGyro.getMetadata().setActuatable(false).setSensable(true);
        gyroSensor.getDeviceProperties().add(propXGyro);
        Property.PropertyDouble propYGyro = new Property.PropertyDouble("Y_GYRO");
        propYGyro.getMetadata().setActuatable(false).setSensable(true);
        gyroSensor.getDeviceProperties().add(propYGyro);
        Property.PropertyDouble propZGyro = new Property.PropertyDouble("Z_GYRO");
        propZGyro.getMetadata().setActuatable(false).setSensable(true);
        gyroSensor.getDeviceProperties().add(propZGyro);

        DeviceType gpsSensor = new DeviceType("EM-506 GPS Receiver")
                .withDescription("EM-506 includes on-board voltage regulation, "
                        + "LED status indicator, battery backed RAM, "
                        + "and a built-in patch antenna. 6-pin interface cable included.");
        gpsSensor.setSemanticType(devTypes.get(SemanticType.SemanticDeviceType.PredefinedDevTypes.Location_Sensor.toString()));
        Property.PropertyDouble propLat = new Property.PropertyDouble("latitude");
        propLat.getMetadata().setActuatable(false).setSensable(true);
        propLat.setSemanticType(propTypes.get(SemanticType.SemanticPropertyType.PredefinedPropTypes.location_lat.toString()));
        Property.PropertyDouble propLon = new Property.PropertyDouble("longitude");
        propLon.setSemanticType(propTypes.get(SemanticType.SemanticPropertyType.PredefinedPropTypes.location_lon.toString()));
        propLon.getMetadata().setActuatable(false).setSensable(true);
        Property.PropertyList propLoc = new Property.PropertyList("location");
        propLoc.addChild(propLat);
        propLoc.addChild(propLon);
        gpsSensor.getDeviceProperties().add(propLoc);

        result.add(ultraSoniceSensor);
        result.add(motionSensor);
        result.add(temperatureSensor);
        result.add(raspiBPlus);
        result.add(waterSensor);
        result.add(gyroSensor);
        result.add(ismartSensor);
        result.add(gpsSensor);

        return result;
    }

}
