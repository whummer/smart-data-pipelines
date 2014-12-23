package io.riots.demo;

import io.riots.core.service.ICatalogService;
import io.riots.core.service.ServiceClientFactory;
import io.riots.services.catalog.Property;
import io.riots.services.catalog.ThingType;
import io.riots.services.catalog.ValueDomainContinuous;
import io.riots.services.catalog.ValueDomainDiscrete;
import io.riots.services.catalog.ValueDomainEnumerated;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author whummer
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = { InsertDemoDataViaCatalog.class })
@ComponentScan(basePackages = "io.riots.core")
@Configuration
@EnableAutoConfiguration
@EnableDiscoveryClient
public class InsertDemoDataViaCatalog {

	static final Logger LOG = Logger.getLogger(InsertDemoDataViaCatalog.class);

    @Autowired
    ServiceClientFactory serviceClientFactory;

    static {
    	String prop = "eureka.client.serviceUrl.defaultZone";
    	if(System.getProperty(prop) == null) {
    		System.setProperty(prop, "http://localhost:10000/eureka/v2/");
    	}
    }

	@Bean
	public HttpServletRequest getServletRequest() {
		return new MockHttpServletRequest();
	}

	public static class TestConfiguration {
	}

//	private Map<String, SemanticType.SemanticPropertyType> propTypes = new HashMap<>();
//	private Map<String, SemanticType.SemanticDeviceType> devTypes = new HashMap<>();

	private static ICatalogService catalog;

	@Before
	public void setup() {
		try {
			catalog = serviceClientFactory.getCatalogServiceClient();
			System.out.println(catalog);
		} catch (Exception e) {
			e.printStackTrace();
			/* service not running, do not run this test class */
		}
	}

	@Test
	public void insertData() {
		if (catalog == null) {
			LOG.info("Catalog service not available, skipping test. Not inserting data.");
			return;
		}
		insertPropData();
		insertDevData();
		insertManufacturerData();
		insertDeviceData();
	}

	private void insertDeviceData() {
		List<ThingType> types = catalog.list("", 1, 100);
		for (ThingType t : getThingData()) {
			if (!isIncluded(types, t.getName())) {
				System.out.println("creating thingtype " + t);
				catalog.create(t);
			}
		}
	}

	private boolean isIncluded(List<ThingType> types, String name) {
		for (ThingType t : types) {
			if (t.getName().equals(name))
				return true;
		}
		return false;
	}

	@SuppressWarnings("all")
	private void insertManufacturerData() {
		// TODO
		// for (Manufacturer t : getManufacturers()) {
		// List<?> types =
		// baseObjectCategorizedRepository.findByCategoryAndName(t.getCategory(),
		// t.getName());
		// if (types.isEmpty()) {
		// t = (Manufacturer) baseObjectCategorizedRepository.save(t);
		// }
		// }
	}

	@SuppressWarnings("all")
	private void insertPropData() {
//		insertData(getPropTypes());
	}

	@SuppressWarnings("all")
	private void insertDevData() {
//		insertData(getDevTypes());
	}

//	@SuppressWarnings("all")
//	private void insertData(List<SemanticType> list) {
		// TODO
		// for (SemanticType t : list) {
		// List<SemanticType> types =
		// baseObjectCategorizedRepository.findByCategoryAndName(t.getCategory(),
		// t.getName());
		// if (types.isEmpty()) {
		// t = (SemanticType) baseObjectCategorizedRepository.save(t);
		// if (t instanceof SemanticType.SemanticPropertyType)
		// propTypes.put(t.getName(), (SemanticType.SemanticPropertyType) t);
		// if (t instanceof SemanticType.SemanticDeviceType)
		// devTypes.put(t.getName(), (SemanticType.SemanticDeviceType) t);
		// }
		// }
//	}

//	public List<SemanticType> getPropTypes() {
//		List<SemanticType> list = new LinkedList<>();
//		for (SemanticType.SemanticPropertyType.PredefinedPropTypes t : SemanticType.SemanticPropertyType.PredefinedPropTypes
//				.values()) {
//			list.add(new SemanticType.SemanticPropertyType(t.name()));
//		}
//		return list;
//	}

//	public List<SemanticType> getDevTypes() {
//		List<SemanticType> list = new LinkedList<>();
//		for (SemanticType.SemanticDeviceType.PredefinedDevTypes t : SemanticType.SemanticDeviceType.PredefinedDevTypes
//				.values()) {
//			list.add(new SemanticType.SemanticDeviceType(t.name()));
//		}
//		return list;
//	}

//	public List<Manufacturer> getManufacturers() {
//		List<Manufacturer> list = new LinkedList<>();
//		list.add(new Manufacturer("_unknown_"));
//		list.add(new Manufacturer("A&D Engineering"));
//		list.add(new Manufacturer("Arduino"));
//		list.add(new Manufacturer("Biospace"));
//		list.add(new Manufacturer("Garmin"));
//		list.add(new Manufacturer("Honeywell"));
//		list.add(new Manufacturer("Interlink Electronics"));
//		list.add(new Manufacturer("Kamstrup"));
//		list.add(new Manufacturer("Keithley"));
//		list.add(new Manufacturer("Philips"));
//		list.add(new Manufacturer("Polar"));
//		list.add(new Manufacturer("Siemens"));
//		list.add(new Manufacturer("SparkFun Electronics"));
//		list.add(new Manufacturer("Texas Instruments"));
//		list.add(new Manufacturer("Tinkerforge"));
//		return list;
//	}

	public List<ThingType> getThingData() {

        List<ThingType> result = new LinkedList<>();

        ThingType ultraSonicSensor = new ThingType("HC-SR04");
        ultraSonicSensor.setImageUrls(Arrays.asList("http://fritzing.org/media/fritzing-repo/projects/h/hc-sr04-project/images/HC-SR04-2.jpg"));
        ultraSonicSensor.setDescription(
                        "The HC-SR04 Ultrasonic Range Sensor uses non-contact ultrasound sonar to measure the "
                                + "distance to an object - they're great for any obstacle avoiding systems on Raspberry Pi robots "
                                + "or rovers! The HC-SR04 consists of two ultrasonic transmitters (basically speakers), a receiver, and a control circuit.");
        ultraSonicSensor.addFeature("input_voltage", "5V");
        ultraSonicSensor.addFeature("current-draw", "20mA");
        ultraSonicSensor.addFeature("sensing-angle", "30°");
        ultraSonicSensor.addFeature("width", "20mm");
        ultraSonicSensor.addFeature("height", "15mm");
        ultraSonicSensor.addFeature("length", "35mm");
        ultraSonicSensor.addFeature("temperature", "-15C..70C");
        Property propDist = new Property("distance");
        propDist.setActuatable(false).setSensable(true);
        propDist.setValueDomain(new ValueDomainContinuous<Double>(0.0, 200.0));
        ultraSonicSensor.getProperties().add(propDist);

        ThingType motionSensor = new ThingType("HC-SR501");
        motionSensor.setImageUrls(Arrays.asList("http://www.linkdelight.com/components/com_virtuemart/shop_image/product/PIR_Sensor_Human_51fb6871f126d.jpg"));
        motionSensor.setDescription(
                        "This PIR includes an adjustable delay before firing (approx 0.5 - 200 seconds), "
                                + "has adjustable sensitivity and two M2 mounting holes! It runs on 4.5V-20V power (or 3V by "
                                + "bypassing the regulator with a bit of soldering) and has a digital signal output  (3.3V) high, "
                                + "0V low. Its sensing range is up to 7 meters in a 100 degree cone.");
        motionSensor.addFeature("input_voltage", "4.5V..20V");
        motionSensor.addFeature("current-draw", "50mA");
        motionSensor.addFeature("sensing-angle", "100°");
        motionSensor.addFeature("range", "5m..7m");
        motionSensor.addFeature("width", "32mm");
        motionSensor.addFeature("height", "25mm");
        motionSensor.addFeature("length", "25mm");
        motionSensor.addFeature("temperature", "-15C..70C");
        Property propMotion = new Property("motion");
        propMotion.setActuatable(false).setSensable(true);
        propMotion.setValueDomain(new ValueDomainEnumerated<Boolean>(true, false));
        motionSensor.getProperties().add(propMotion);

        ThingType temperatureSensor = new ThingType("DS18B20");
        temperatureSensor.setImageUrls(Arrays.asList("http://www.3bm.de/wp-content/uploads/2013/09/DS18B20.jpg"));
        temperatureSensor.setDescription(
                        "A genuine Maxim sourced DS18B20+ One Wire Digital Temperature Sensor. The DS18B20+ "
                                + "is the perfect low-cost solution for a range of Raspberry Pi and Arduino temperature control "
                                + "and data-logging projects! The DS18B20+ measures temperature in degrees Celsius with 9 to"
                                + " 12-bit precision and includes an alarm function with nonvolatile user-programmable upper"
                                + " and lower trigger points. Sensing range is -55C to 125C (accurate to ±0.5°C over the range "
                                + "of -10°C to +85°C), and each sensor has a unique 64-bit serial number hard-programmed enabling "
                                + "the use of a number of sensors on a single data bus.");
        temperatureSensor.addFeature("input_voltage", "3V..5V");
                temperatureSensor.addFeature("resolution", "9bit..12bit");
                temperatureSensor.addFeature("temperature", "-55C..125C");
        Property propTemp = new Property("temperature");
//        propTemp.setSemanticType(propTypes.get(SemanticType.SemanticPropertyType.PredefinedPropTypes.temperature.toString()));
        propTemp.setValueDomain(new ValueDomainDiscrete<>(-15.0, 70.0, 0.1));
        propTemp.setActuatable(false).setSensable(true);
        temperatureSensor.getProperties().add(propTemp);

        ThingType raspiBPlus = new ThingType("Raspberry Pi Model B+");
        raspiBPlus.setImageUrls(Arrays.asList("https://cdn.sparkfun.com//assets/parts/9/9/4/4/12994-01.jpg"));
        raspiBPlus.setDescription("512MB RAM, new GPIO, microSD");
        raspiBPlus.addChild(motionSensor);
        raspiBPlus.addChild(temperatureSensor);
        raspiBPlus.addChild(ultraSonicSensor);
        Property propGPU = new Property("GPU_MEM");
        propGPU.setValueDomain(new ValueDomainDiscrete<>(16L, 448L, 1L));
        propGPU.setActuatable(true).setSensable(true);
        raspiBPlus.getProperties().add(propGPU);
        Property propSDTV = new Property("SDTV_MODE");
        propSDTV.setValueDomain(new ValueDomainEnumerated<Long>(0L, 1L, 2L, 3L));
        propSDTV.setActuatable(true).setSensable(true);
        raspiBPlus.getProperties().add(propSDTV);
        Property propHDMI = new Property("HDMI_MODE");
        propHDMI.setValueDomain(new ValueDomainDiscrete<Long>(0L, 59L, 1L));
        propHDMI.setActuatable(true).setSensable(true);
        raspiBPlus.getProperties().add(propHDMI);
        Property propFB = new Property("FRAMEBUFFER_DEPTH");
        propFB.setValueDomain(new ValueDomainEnumerated<Long>(8L, 16L, 24L, 32L));
        propFB.setActuatable(true).setSensable(true);
        raspiBPlus.getProperties().add(propFB);

        ThingType ismartSensor = new ThingType("iSmart Alarm");
        ismartSensor.setImageUrls(Arrays.asList("https://s3.amazonaws.com/ksr/assets/000/317/258/fe73cdeb496407133781ebfc2e152b9f_large.png?1356632247"));
        ismartSensor.setDescription("Wireless motion detector");
        Property propMotion1 = new Property("motion");
        propMotion1.setActuatable(false).setSensable(true);
        propMotion1.setValueDomain(new ValueDomainEnumerated<Boolean>(true, false));
        ismartSensor.getProperties().add(propMotion1);

        ThingType waterSensor = new ThingType("AQUAlogger 210PTdeep");
        waterSensor.setImageUrls(Arrays.asList("http://img.nauticexpo.com/images_ne/photo-m2/hydrophone-probe-oceanographic-survey-preamplified-hydrophone-40202-4913311.jpg"));
        waterSensor.setDescription("Deep water data logger that measures "
                        + "and records temperature and pressure");
        Property propPressure = new Property("pressure");
        propPressure.setValueDomain(new ValueDomainDiscrete<>(0.0, 100.0, 0.01));
        propPressure.setActuatable(true).setSensable(true);
//        propPressure.setSemanticType(propTypes.get(SemanticType.SemanticPropertyType.PredefinedPropTypes.pressure.toString()));
        waterSensor.getProperties().add(propPressure);
        Property propTemp1 = new Property("temperature");
        propTemp1.setValueDomain(new ValueDomainDiscrete<>(-2.0, 30.0, 0.05));
        propTemp1.setActuatable(true).setSensable(true);
//        propTemp1.setSemanticType(propTypes.get(SemanticType.SemanticPropertyType.PredefinedPropTypes.temperature.toString()));
        waterSensor.getProperties().add(propTemp1);

        ThingType gyroSensor = new ThingType("MPU-6000 Six Axis Motion Tracker");
        gyroSensor.setImageUrls(Arrays.asList("http://img.auctiva.com/imgdata/1/8/7/9/0/1/5/webimg/769218226_o.jpg"));
        gyroSensor.setDescription("Motion tracking device which is a combination of a "
                        + "3-axis gyroscope and a 3-axis accelerometer "
                        + "with an onboard Digital Motion Processor™, "
                        + "which can also access other external sensors");
        Property propXAccel = new Property("X_ACCEL");
        propXAccel.setActuatable(false).setSensable(true);
        gyroSensor.getProperties().add(propXAccel);
        Property propYAccel = new Property("Y_ACCEL");
        propYAccel.setActuatable(false).setSensable(true);
        gyroSensor.getProperties().add(propYAccel);
        Property propZAccel = new Property("Z_ACCEL");
        propZAccel.setActuatable(false).setSensable(true);
        gyroSensor.getProperties().add(propZAccel);
        Property propXGyro = new Property("X_GYRO");
        propXGyro.setActuatable(false).setSensable(true);
        gyroSensor.getProperties().add(propXGyro);
        Property propYGyro = new Property("Y_GYRO");
        propYGyro.setActuatable(false).setSensable(true);
        gyroSensor.getProperties().add(propYGyro);
        Property propZGyro = new Property("Z_GYRO");
        propZGyro.setActuatable(false).setSensable(true);
        gyroSensor.getProperties().add(propZGyro);

        ThingType gpsSensor = new ThingType("EM-506 GPS Receiver");
        gpsSensor.setImageUrls(Arrays.asList("https://cdn.sparkfun.com//assets/parts/9/5/1/2/12751-01.jpg"));
        gpsSensor.setDescription("EM-506 includes on-board voltage regulation, "
                        + "LED status indicator, battery backed RAM, "
                        + "and a built-in patch antenna. 6-pin interface cable included.");
//        gpsSensor.setSemanticType(devTypes.get(SemanticType.SemanticDeviceType.PredefinedDevTypes.Location_Sensor.toString()));
        Property propLat = new Property("latitude");
        propLat.setActuatable(false).setSensable(true);
//        propLat.setSemanticType(propTypes.get(SemanticType.SemanticPropertyType.PredefinedPropTypes.location_lat.toString()));
        Property propLon = new Property("longitude");
//        propLon.setSemanticType(propTypes.get(SemanticType.SemanticPropertyType.PredefinedPropTypes.location_lon.toString()));
        propLon.setActuatable(false).setSensable(true);
        Property propLoc = new Property("location");
        propLoc.addChild(propLat);
        propLoc.addChild(propLon);
        gpsSensor.getProperties().add(propLoc);

        result.add(ultraSonicSensor);
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
