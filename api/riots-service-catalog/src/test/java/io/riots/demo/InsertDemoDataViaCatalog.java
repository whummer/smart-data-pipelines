package io.riots.demo;

import io.riots.core.service.ServiceClientFactory;
import io.riots.services.CatalogService;
import io.riots.services.catalog.Property;
import io.riots.services.catalog.ThingType;
import io.riots.services.catalog.ValueDomainContinuous;
import io.riots.services.catalog.ValueDomainDiscrete;
import io.riots.services.catalog.ValueDomainEnumerated;

import java.util.Arrays;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.ApplicationContext;
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
@EnableConfigurationProperties
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

    @Autowired
    ApplicationContext context;


	public static class TestConfiguration {
	}

	private static CatalogService catalog;

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
		insertThingData();
	}

	private ThingType getExisting(List<ThingType> types, String name) {
		for (ThingType t : types) {
			if (t.getName().equals(name))
				return t;
		}
		return null;
	}
	private boolean isIncluded(List<ThingType> types, String name) {
		return getExisting(types, name) != null;
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

	private void insertThingData() {
		List<ThingType> types = catalog.listThingTypes("", 0, 1000);
		insertThingData(types);
	}

	private ThingType getOrCreateThingType(ThingType type, List<ThingType> existing) {
		if (!isIncluded(existing, type.getName())) {
			return catalog.createThingType(type);
		}
		return getExisting(existing, type.getName());
	}

	public void insertThingData(List<ThingType> existing) {

        ThingType ultraSonicSensor = new ThingType("HC-SR04");
        {
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
	
	        ultraSonicSensor = getOrCreateThingType(ultraSonicSensor, existing);
        }

        ThingType motionSensor = new ThingType("HC-SR501");
        {
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

	        motionSensor = getOrCreateThingType(motionSensor, existing);
        }

        ThingType temperatureSensor = new ThingType("DS18B20");
        {
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
	        propTemp.setValueDomain(new ValueDomainDiscrete<>(-15.0, 70.0, 0.1));
	        propTemp.setActuatable(false).setSensable(true);
	        temperatureSensor.getProperties().add(propTemp);
	     
	        temperatureSensor = getOrCreateThingType(temperatureSensor, existing);
        }

        {
	        ThingType raspiBPlus = new ThingType("Raspberry Pi Model B+");
	        raspiBPlus.setImageUrls(Arrays.asList("https://cdn.sparkfun.com//assets/parts/9/9/4/4/12994-01.jpg"));
	        raspiBPlus.setDescription("512MB RAM, new GPIO, microSD");
	        raspiBPlus.addChild(motionSensor.getId());
	        raspiBPlus.addChild(temperatureSensor.getId());
	        raspiBPlus.addChild(ultraSonicSensor.getId());
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
	        
	        getOrCreateThingType(raspiBPlus, existing);
        }

        {
	        ThingType ismartSensor = new ThingType("iSmart Alarm");
	        ismartSensor.setImageUrls(Arrays.asList("https://s3.amazonaws.com/ksr/assets/000/317/258/fe73cdeb496407133781ebfc2e152b9f_large.png?1356632247"));
	        ismartSensor.setDescription("Wireless motion detector");
	        Property propMotion1 = new Property("motion");
	        propMotion1.setActuatable(false).setSensable(true);
	        propMotion1.setValueDomain(new ValueDomainEnumerated<Boolean>(true, false));
	        ismartSensor.getProperties().add(propMotion1);
	        
	        getOrCreateThingType(ismartSensor, existing);
        }

        {
	        ThingType waterSensor = new ThingType("AQUAlogger 210PTdeep");
	        waterSensor.setImageUrls(Arrays.asList("http://img.nauticexpo.com/images_ne/photo-m2/hydrophone-probe-oceanographic-survey-preamplified-hydrophone-40202-4913311.jpg"));
	        waterSensor.setDescription("Deep water data logger that measures "
	                        + "and records temperature and pressure");
	        Property propPressure = new Property("pressure");
	        propPressure.setValueDomain(new ValueDomainDiscrete<>(0.0, 100.0, 0.01));
	        propPressure.setActuatable(true).setSensable(true);
	        waterSensor.getProperties().add(propPressure);
	        Property propTemp1 = new Property("temperature");
	        propTemp1.setValueDomain(new ValueDomainDiscrete<>(-2.0, 30.0, 0.05));
	        propTemp1.setActuatable(true).setSensable(true);
	        waterSensor.getProperties().add(propTemp1);

	        getOrCreateThingType(waterSensor, existing);
        }

        {
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

	        getOrCreateThingType(gyroSensor, existing);
        }

        ThingType gpsSensor = new ThingType("EM-506 GPS Receiver");
        {
	        gpsSensor.setImageUrls(Arrays.asList("https://cdn.sparkfun.com//assets/parts/9/5/1/2/12751-01.jpg"));
	        gpsSensor.setDescription("EM-506 includes on-board voltage regulation, "
	                        + "LED status indicator, battery backed RAM, "
	                        + "and a built-in patch antenna. 6-pin interface cable included.");
	        Property propLat = new Property("latitude");
	        propLat.setActuatable(false).setSensable(true);
	        Property propLon = new Property("longitude");
	        propLon.setActuatable(false).setSensable(true);
	        Property propLoc = new Property("location");
	        propLoc.addChild(propLat);
	        propLoc.addChild(propLon);
	        gpsSensor.getProperties().add(propLoc);

	        gpsSensor = getOrCreateThingType(gpsSensor, existing);
        }

        ThingType appleGyroSensor = new ThingType("Kionix KXM52-1050");
        {
	        appleGyroSensor.setImageUrls(Arrays.asList("http://akizukidenshi.com/img/goods/C/I-04280.jpg"));
	        appleGyroSensor.setDescription("The Kionix KXM52-1050 tri-axial accelerometer "
	        		+ "is a high performance silicon micro-machined linear accelerometer "
	        		+ "consisting of a sensing element and a CMOS signal conditioning ASIC "
	        		+ "(Application Specific Integrated Circuit) packaged in a standard "
	        		+ "5×5×1.8mm DFN (DualFlat Non-lead).");
	        Property propXGyro1 = new Property("X_GYRO");
	        propXGyro1.setActuatable(false).setSensable(true);
	        appleGyroSensor.getProperties().add(propXGyro1);
	        Property propYGyro1 = new Property("Y_GYRO");
	        propYGyro1.setActuatable(false).setSensable(true);
	        appleGyroSensor.getProperties().add(propYGyro1);
	        Property propZGyro1 = new Property("Z_GYRO");
	        propZGyro1.setActuatable(false).setSensable(true);
	        appleGyroSensor.getProperties().add(propZGyro1);
	        
	        appleGyroSensor = getOrCreateThingType(appleGyroSensor, existing);
        }

        ThingType wpsSensor = new ThingType("Wireless Positioning System (WPS)");
        {
	        wpsSensor.setImageUrls(Arrays.asList("https://www.newbrandanalytics.com/blog/wp-content/uploads/2013/12/black-wifi-icon-hi-2.png"));
	        wpsSensor.setDescription("Wi-Fi network identification for localization. "
	        		+ "This is called a Wi-Fi Positioning System (WPS). "
	        		+ "The access points name and signal strength is determined and looked "
	        		+ "up in a database to identify the location. The more access points are "
	        		+ "found, the more precise the localization..");
	        Property propLat = new Property("latitude");
	        propLat.setActuatable(false).setSensable(true);
	        Property propLon = new Property("longitude");
	        propLon.setActuatable(false).setSensable(true);
	        Property propLoc = new Property("location");
	        propLoc.setActuatable(false).setSensable(true);
	        propLoc.addChild(propLat);
	        propLoc.addChild(propLon);
	        wpsSensor.getProperties().add(propLoc);

	        wpsSensor = getOrCreateThingType(wpsSensor, existing);
        }

        {
            ThingType appleMacBook = new ThingType("Apple Macbook Pro");
	        appleMacBook.setImageUrls(Arrays.asList("http://www1.pcmag.com/media/images/365183-apple-macbook-pro-13-inch-retina-2014.jpg"));
	        appleMacBook.setDescription("Apple's Macbook laptop with integrated sensors.");
	        appleMacBook.addChild(appleGyroSensor.getId());
	        appleMacBook.addChild(wpsSensor.getId());

	        getOrCreateThingType(appleMacBook, existing);
        }

        ThingType batterySensor = new ThingType("MM9Z1J638 Battery Sensor");
        {
        	batterySensor.setImageUrls(Arrays.asList("http://www.engineerlive.com/sites/default/files/styles/article/public/eee%20sensors%20may14%20freescale.jpg?itok=9RL_D_e4"));
        	batterySensor.setDescription("Designed to support both conventional and "
        			+ "emerging battery chemistries for automotive and industrial applications, "
        			+ "the MM9Z1J638 battery sensor measures key battery parameters for monitoring "
        			+ "state of health (SOH), state of charge (SOC) and state of function (SOF) "
        			+ "for early failure prediction. A flexible four-cell front end architecture "
        			+ "supports conventional 12V lead acid batteries as well as emerging battery "
        			+ "applications, such as 14V stacked cell Li-Ion, high voltage junction boxes, "
        			+ "and 24V truck batteries.");
	        Property propBat = new Property("batteryPercent");
	        propBat.setValueDomain(new ValueDomainContinuous<Double>(0.0, 100.0));
	        propBat.setActuatable(false).setSensable(true);
	        batterySensor.getProperties().add(propBat);

	        batterySensor = getOrCreateThingType(batterySensor, existing);
        }

        ThingType pressureSensor = new ThingType("Oro-Tek™ Tire Pressure Sensor");
        {
        	pressureSensor.setImageUrls(Arrays.asList("http://www.carid.com/images/oro-tek/tpms-sensors/oro-tek-tpms-sensor.jpg"));
        	pressureSensor.setDescription("Sensor for monitoring tire pressure.");
	        Property propBat = new Property("pressure");
	        propBat.setUnit("bar");
	        propBat.setValueDomain(new ValueDomainContinuous<Double>(0.0, 6.0));
	        propBat.setActuatable(false).setSensable(true);
	        pressureSensor.getProperties().add(propBat);

	        pressureSensor = getOrCreateThingType(pressureSensor, existing);
        }

        {
            ThingType golfCart = new ThingType("Yamaha DRIVE Golf Car");
	        golfCart.setImageUrls(Arrays.asList("http://www.franksgolfcarts.com/images/yamaha2.png"));
	        golfCart.setDescription("Deep in the DNA of The DRIVE® is everything "
	        		+ "we’ve learned from our motorcycles, ATV’s and watercraft, "
	        		+ "including the ability to build with fewer parts, which leads "
	        		+ "to lighter weight, which leads to superior hill-climbing ability, "
	        		+ "a virtually greaseless chassis and the lowest maintenance costs in the industry.");
	        golfCart.addChild(wpsSensor.getId());
	        golfCart.addChild(batterySensor.getId());
	        golfCart.addChild(pressureSensor.getId());
	        golfCart.addChild(temperatureSensor.getId());

	        golfCart = getOrCreateThingType(golfCart, existing);
        }

        {
            ThingType clubCar = new ThingType("Club Car Precedent i2 Golf Car");
	        clubCar.setImageUrls(Arrays.asList("http://www.jeffreyalleninc.com/userfiles/images/Prec%204%20Pass.jpg"));
	        clubCar.setDescription("Up to 4 passengers can enjoy the unique sense of "
	        		+ "style, quality, durability, and reliability that only "
	        		+ "Club Car golf car can provide with the Precedent 4-Passenger. "
	        		+ "New features make it more efficient and capable than ever — "
	        		+ "and it’s all designed with you in mind.");
	        clubCar.addChild(gpsSensor.getId());
	        clubCar.addChild(batterySensor.getId());
	        clubCar.addChild(pressureSensor.getId());
	        clubCar.addChild(temperatureSensor.getId());

	        clubCar = getOrCreateThingType(clubCar, existing);
        }

    }
}
