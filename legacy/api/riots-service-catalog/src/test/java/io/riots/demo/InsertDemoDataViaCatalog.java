package io.riots.demo;

import io.riots.api.services.billing.BillingService;
import io.riots.api.services.billing.PricingPlan;
import io.riots.api.services.billing.TimePeriod;
import io.riots.api.services.catalog.*;
import io.riots.api.services.model.interfaces.ObjectNamed;
import io.riots.api.services.sim.PropertySimulationFunctionBased;
import io.riots.api.services.sim.PropertySimulationGPS;
import io.riots.api.services.sim.SimulationService;
import io.riots.api.services.sim.SimulationType;
import io.riots.api.services.users.UserActionType;
import io.riots.api.services.users.UsersService;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.clients.ServiceClientFactory;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.IOUtils;
import org.apache.cxf.jaxrs.client.WebClient;
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
import org.springframework.context.annotation.FilterType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URL;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

/**
 * @author whummer
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {InsertDemoDataViaCatalog.class})
@ComponentScan(basePackages = {"io.riots.core"}, excludeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, value = Configuration.class))
@Configuration
@EnableAutoConfiguration
@EnableDiscoveryClient
@EnableConfigurationProperties
public class InsertDemoDataViaCatalog {

    static final Logger LOG = Logger.getLogger(InsertDemoDataViaCatalog.class);
	private static CatalogService catalog;
	private static SimulationService simulations;
	private static BillingService billing;
    @Autowired
    ServiceClientFactory serviceClientFactory;

    static {
        String prop = "eureka.client.serviceUrl.defaultZone";
        if (System.getProperty(prop) == null) {
            System.setProperty(prop, "http://localhost:10000/eureka/");
        }
    }
	@Autowired
	ApplicationContext context;

    @Bean
    public HttpServletRequest getServletRequest() {
        return new MockHttpServletRequest();
    }

    @Before
    public void setup() {
        try {
            catalog = serviceClientFactory.getCatalogServiceClient();
            simulations = serviceClientFactory.getSimulationsServiceClient();
            billing = serviceClientFactory.getBillingServiceClient(AuthHeaders.INTERNAL_CALL);

            // TODO uncomment to insert test data into public webapp
//            catalog = serviceClientFactory.getServiceInstanceForURL(
//            		"http://platform.riots.io:8083/api/v1", CatalogService.class);
//            simulations = serviceClientFactory.getServiceInstanceForURL(
//            		"http://platform.riots.io:8086/api/v1", SimulationService.class);
//            billing = serviceClientFactory.getServiceInstanceForURL(
//            		"http://platform.riots.io:8086/api/v1", BillingService.class);

            WebClient.client(simulations).header(AuthHeaders.HEADER_AUTH_EMAIL, "test@riots.io");
        } catch (Exception e) {
            e.printStackTrace();
            /* services not running, do not run this test class */
        }
    }

    @Test
    public void insertData() throws IOException {
        if (catalog == null || simulations == null) {
            LOG.info("Services not available, skipping test. Not inserting data.");
            return;
        }
        insertPropData();
        insertDevData();
        insertManufacturerData();
        insertThingData();
        insertSimulationData();
        insertBillingPlans();
    }

    private void insertBillingPlans() {
    	PricingPlan plan0 = new PricingPlan(UsersService.DEFAULT_BILLING_PLAN, "Trial Account", 0);
		plan0.addLimit(UserActionType.API_ACCESS, 1, TimePeriod.PER_SECOND);
		plan0.addLimit(UserActionType.API_ACCESS, 10000, TimePeriod.OVERALL);

    	PricingPlan plan1 = new PricingPlan("personal", "Personal Plan", 5);
		plan1.addLimit(UserActionType.API_ACCESS, 5, TimePeriod.PER_SECOND);
		plan1.addLimit(UserActionType.API_ACCESS, 50000, TimePeriod.BILLING_PERIOD);

    	PricingPlan plan2 = new PricingPlan("professional", "Professional Plan", 50);
		plan2.addLimit(UserActionType.API_ACCESS, 20, TimePeriod.PER_SECOND);
		plan2.addLimit(UserActionType.API_ACCESS, 250000, TimePeriod.BILLING_PERIOD);

    	PricingPlan plan3 = new PricingPlan("business", "Business Plan", 250);
		plan3.addLimit(UserActionType.API_ACCESS, 100, TimePeriod.PER_SECOND);
		plan3.addLimit(UserActionType.API_ACCESS, 2000000, TimePeriod.BILLING_PERIOD);

    	PricingPlan plan4 = new PricingPlan("pay_per_use", "Pay Per Use", 0);

    	List<PricingPlan> list = billing.getPlans();
    	for(PricingPlan p : Arrays.asList(plan0, plan1, plan2, plan3, plan4)) {
    		boolean exists = isIncluded(list, p.getName());
    		if(!exists) {
    			billing.saveBillingPlan(p);
    		}
    	}
	}

	private void insertSimulationData() {
		List<SimulationType> existing = simulations.listSimTypes(0, 1000);
		{
			SimulationType t = new SimulationType();
			t.setName("Linear Decay");
			PropertySimulationFunctionBased sim = new PropertySimulationFunctionBased();
			sim.startTime = 1;
			sim.endTime = 500;
			sim.stepInterval = 1;
			sim.setFunction("max(0,1-x/" + sim.endTime + ") * 100");
			t.setSimulation(sim);
			createSimType(existing, t);
		}
		{
			SimulationType t = new SimulationType();
			t.setName("Logarithmic Decay");
			PropertySimulationFunctionBased sim = new PropertySimulationFunctionBased();
			sim.startTime = 1;
			sim.endTime = 500;
			sim.stepInterval = 1;
			sim.setFunction("(1/x) * 100");
			t.setSimulation(sim);
			createSimType(existing, t);
		}
		{
			SimulationType t = new SimulationType();
			t.setName("GPS Trace - Vienna/Austria");
			PropertySimulationGPS sim = new PropertySimulationGPS();
			sim.startTime = 1;
			sim.endTime = 500;
			sim.stepInterval = 1;
			sim.setRepetitions(-1);
			sim.setLatitude(48.19742);
			sim.setLongitude(16.37127);
			sim.setDiameter(1000); // meters
			sim.setMaxSpeed(50); // km/h
			t.setSimulation(sim);
			createSimType(existing, t);
		}
	}

    private void createSimType(List<SimulationType> existing, SimulationType t) {
        for (SimulationType e : existing) {
			if (e.getName().equals(t.getName())) {
                return;
            }
        }
        simulations.createSimType(t);
    }

    private ObjectNamed getExisting(List<? extends ObjectNamed> list, String name) {
        for (ObjectNamed t : list) {
            if (name.equals(t.getName()))
                return t;
        }
        return null;
    }

	private boolean isIncluded(List<? extends ObjectNamed> types, String name) {
		return getExisting(types, name) != null;
	}

	@SuppressWarnings("all")
	private void insertManufacturerData() {
		List<? extends Manufacturer> existingManufacturers = catalog.listManufacturers(null, 0, 100);
		for (Manufacturer manfacturer : getManufacturers()) {
			if (existingManufacturers.stream().anyMatch(m -> m.getName().equals(manfacturer.getName()))) {
				System.out.println("Skipping existing manufacturer: " + manfacturer.getName());
			} else {
				catalog.createManufacturer(manfacturer);
			}

		}
	}

	@SuppressWarnings("all")
	private void insertPropData() {
//		insertData(getPropTypes());
	}

	@SuppressWarnings("all")
	private void insertDevData() {
//		insertData(getDevTypes());
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

	private void insertThingData() throws IOException {
		List<? extends ThingType> types = catalog.listThingTypes("", 0, 1000);
		System.out.println("existing: " + types);
		insertThingData(types);
	}

	private ThingType getOrCreateThingType(ThingType type, List<? extends ThingType> existing) {
		if (!isIncluded(existing, type.getName())) {
			return catalog.createThingType(type);
		}

		return (ThingType) getExisting(existing, type.getName());
	}

	public void insertThingData(List<? extends ThingType> existing) throws IOException {

		ThingType ultraSonicSensor = new ThingType("HC-SR04");
		{

			ultraSonicSensor.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("http://fritzing.org/media/fritzing-repo/projects/h/hc-sr04-project/images/HC-SR04-2.jpg"))
							.withContentType("image/jpeg")));

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
			ultraSonicSensor.addTag("ultrasonic");
			ultraSonicSensor.addTag("raspberry");
			Property propDist = new Property("distance");
			propDist.setPropertyType(PropertyType.DOUBLE);
			propDist.setActuatable(false).setSensable(true);
			propDist.setValueDomain(new ValueDomainContinuous<Double>(0.0, 200.0));
			ultraSonicSensor.getProperties().add(propDist);

			ultraSonicSensor = getOrCreateThingType(ultraSonicSensor, existing);
		}

		ThingType motionSensor = new ThingType("HC-SR501");
		{

			motionSensor.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("http://www.linkdelight.com/components/com_virtuemart/shop_image/product/PIR_Sensor_Human_51fb6871f126d.jpg"))
									//.withBase64String(getBase64ImageFromUrl("http://www.linkdelight.com/components/com_virtuemart/shop_image/product/PIR_Sensor_Human_51fb6871f126d.jpg")
							.withContentType("image/jpeg")));
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
			motionSensor.addTag("motion");
			Property propMotion = new Property("motion");
			propMotion.setPropertyType(PropertyType.BOOLEAN);
			propMotion.setActuatable(false).setSensable(true);
			propMotion.setValueDomain(new ValueDomainEnumerated<Boolean>(true, false));
			motionSensor.getProperties().add(propMotion);

			motionSensor = getOrCreateThingType(motionSensor, existing);
		}

		ThingType temperatureSensor = new ThingType("DS18B20 Temperature Sensor");
		{
			temperatureSensor.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl(
									//"http://www.3bm.de/wp-content/uploads/2013/09/DS18B20.jpg"
									"http://s1.electrodragon.com/wp-content/uploads/2011/11/ds18b20.jpg"))
									//.withHref("http://www.3bm.de/wp-content/uploads/2013/09/DS18B20.jpg")
							.withContentType("image/jpeg")));
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
			temperatureSensor.addTag("temperature");
			Property propTemp = new Property("temperature");
			propTemp.setPropertyType(PropertyType.DOUBLE);
			propTemp.setValueDomain(new ValueDomainDiscrete<>(-15.0, 70.0, 0.1));
			propTemp.setActuatable(false).setSensable(true);
			temperatureSensor.getProperties().add(propTemp);

			temperatureSensor = getOrCreateThingType(temperatureSensor, existing);
		}

		{
			ThingType raspiBPlus = new ThingType("Raspberry Pi Model B+");
			raspiBPlus.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("https://cdn.sparkfun.com//assets/parts/9/9/4/4/12994-01.jpg"))
									//.withHref("https://cdn.sparkfun.com//assets/parts/9/9/4/4/12994-01.jpg")
							.withContentType("image/jpeg")));
			raspiBPlus.setDescription("512MB RAM, new GPIO, microSD");
			raspiBPlus.addChild(motionSensor.getId());
			raspiBPlus.addChild(temperatureSensor.getId());
			raspiBPlus.addChild(ultraSonicSensor.getId());
			raspiBPlus.addTag("raspberry");
			raspiBPlus.addTag("Micro SD");
			raspiBPlus.addTag("small");
			Property propGPU = new Property("GPU_MEM");
			propGPU.setPropertyType(PropertyType.LONG);
			propGPU.setValueDomain(new ValueDomainDiscrete<>(16L, 448L, 1L));
			propGPU.setActuatable(true).setSensable(true);
			raspiBPlus.getProperties().add(propGPU);
			Property propSDTV = new Property("SDTV_MODE");
			propSDTV.setPropertyType(PropertyType.LONG);
			propSDTV.setValueDomain(new ValueDomainEnumerated<Long>(0L, 1L, 2L, 3L));
			propSDTV.setActuatable(true).setSensable(true);
			raspiBPlus.getProperties().add(propSDTV);
			Property propHDMI = new Property("HDMI_MODE");
			propHDMI.setPropertyType(PropertyType.LONG);
			propHDMI.setValueDomain(new ValueDomainDiscrete<Long>(0L, 59L, 1L));
			propHDMI.setActuatable(true).setSensable(true);
			raspiBPlus.getProperties().add(propHDMI);
			Property propFB = new Property("FRAMEBUFFER_DEPTH");
			propFB.setPropertyType(PropertyType.LONG);
			propFB.setValueDomain(new ValueDomainEnumerated<Long>(8L, 16L, 24L, 32L));
			propFB.setActuatable(true).setSensable(true);
			raspiBPlus.getProperties().add(propFB);

			getOrCreateThingType(raspiBPlus, existing);
		}

		{
			ThingType ismartSensor = new ThingType("iSmart Alarm");
			ismartSensor.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("https://s3.amazonaws.com/ksr/assets/000/317/258/fe73cdeb496407133781ebfc2e152b9f_large.png?1356632247"))
							.withContentType("image/png")));
			ismartSensor.setDescription("Wireless motion detector");
			ismartSensor.addTag("motion");
			ismartSensor.addTag("sensor");
			ismartSensor.addTag("alarm");
			Property propMotion1 = new Property("motion");
			propMotion1.setPropertyType(PropertyType.BOOLEAN);
			propMotion1.setActuatable(false).setSensable(true);
			propMotion1.setValueDomain(new ValueDomainEnumerated<Boolean>(true, false));
			ismartSensor.getProperties().add(propMotion1);

			getOrCreateThingType(ismartSensor, existing);
		}

		{
			ThingType waterSensor = new ThingType("AQUAlogger 210PTdeep");
			waterSensor.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("http://img.nauticexpo.com/images_ne/photo-m2/hydrophone-probe-oceanographic-survey-preamplified-hydrophone-40202-4913311.jpg"))
							.withContentType("image/jpeg")));
			waterSensor.setDescription("Deep water data logger that measures "
					+ "and records temperature and pressure");
			waterSensor.addTag("water");
			waterSensor.addTag("sensor");
			waterSensor.addTag("pressure");
			waterSensor.addTag("temperature");
			Property propPressure = new Property("pressure");
			propPressure.setPropertyType(PropertyType.DOUBLE);
			propPressure.setValueDomain(new ValueDomainDiscrete<>(0.0, 100.0, 0.01));
			propPressure.setActuatable(true).setSensable(true);
			waterSensor.getProperties().add(propPressure);
			Property propTemp1 = new Property("temperature");
			propTemp1.setPropertyType(PropertyType.DOUBLE);
			propTemp1.setValueDomain(new ValueDomainDiscrete<>(-2.0, 30.0, 0.05));
			propTemp1.setActuatable(true).setSensable(true);
			waterSensor.getProperties().add(propTemp1);

			getOrCreateThingType(waterSensor, existing);
		}

		{
			ThingType gyroSensor = new ThingType("MPU-6000 Six Axis Motion Tracker");
			gyroSensor.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("http://img.auctiva.com/imgdata/1/8/7/9/0/1/5/webimg/769218226_o.jpg"))
							.withContentType("image/jpeg")));
			gyroSensor.setDescription("Motion tracking device which is a combination of a "
					+ "3-axis gyroscope and a 3-axis accelerometer "
					+ "with an onboard Digital Motion Processor™, "
					+ "which can also access other external sensors");
			gyroSensor.addTag("gyro");
			gyroSensor.addTag("6-axis");
			gyroSensor.addTag("sensor");
			Property propXAccel = new Property("X_ACCEL");
			propXAccel.setPropertyType(PropertyType.DOUBLE);
			propXAccel.setActuatable(false).setSensable(true);
			gyroSensor.getProperties().add(propXAccel);
			Property propYAccel = new Property("Y_ACCEL");
			propYAccel.setPropertyType(PropertyType.DOUBLE);
			propYAccel.setActuatable(false).setSensable(true);
			gyroSensor.getProperties().add(propYAccel);
			Property propZAccel = new Property("Z_ACCEL");
			propZAccel.setPropertyType(PropertyType.DOUBLE);
			propZAccel.setActuatable(false).setSensable(true);
			gyroSensor.getProperties().add(propZAccel);
			Property propXGyro = new Property("X_GYRO");
			propXGyro.setPropertyType(PropertyType.DOUBLE);
			propXGyro.setActuatable(false).setSensable(true);
			gyroSensor.getProperties().add(propXGyro);
			Property propYGyro = new Property("Y_GYRO");
			propYGyro.setPropertyType(PropertyType.DOUBLE);
			propYGyro.setActuatable(false).setSensable(true);
			gyroSensor.getProperties().add(propYGyro);
			Property propZGyro = new Property("Z_GYRO");
			propZGyro.setPropertyType(PropertyType.DOUBLE);
			propZGyro.setActuatable(false).setSensable(true);
			gyroSensor.getProperties().add(propZGyro);

			getOrCreateThingType(gyroSensor, existing);
		}

		ThingType gpsSensor = new ThingType("EM-506 GPS Receiver");
		{
			gpsSensor.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("https://cdn.sparkfun.com//assets/parts/9/5/1/2/12751-01.jpg"))
							.withContentType("image/jpeg")));
			gpsSensor.setDescription("EM-506 includes on-board voltage regulation, "
					+ "LED status indicator, battery backed RAM, "
					+ "and a built-in patch antenna. 6-pin interface cable included.");
			gpsSensor.addTag("GPS");
			gpsSensor.addTag("location");
			gpsSensor.addTag("position");
			Property propLat = new Property("latitude");
			propLat.setPropertyType(PropertyType.LOCATION_LAT);
			propLat.setActuatable(false).setSensable(true);
			Property propLon = new Property("longitude");
			propLon.setPropertyType(PropertyType.LOCATION_LON);
			propLon.setActuatable(false).setSensable(true);
			Property propLoc = new Property("location");
			propLoc.setPropertyType(PropertyType.LOCATION);
			propLoc.addChild(propLat);
			propLoc.addChild(propLon);
			gpsSensor.getProperties().add(propLoc);

			gpsSensor = getOrCreateThingType(gpsSensor, existing);
		}

		ThingType appleGyroSensor = new ThingType("Kionix KXM52-1050");
		{
			appleGyroSensor.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("http://akizukidenshi.com/img/goods/C/I-04280.jpg"))
							.withContentType("image/jpeg")));
			appleGyroSensor.setDescription("The Kionix KXM52-1050 tri-axial accelerometer "
					+ "is a high performance silicon micro-machined linear accelerometer "
					+ "consisting of a sensing element and a CMOS signal conditioning ASIC "
					+ "(Application Specific Integrated Circuit) packaged in a standard "
					+ "5×5×1.8mm DFN (DualFlat Non-lead).");
			appleGyroSensor.addTag("gyro");
			appleGyroSensor.addTag("motion");
			Property propXGyro1 = new Property("X_GYRO");
			propXGyro1.setPropertyType(PropertyType.DOUBLE);
			propXGyro1.setActuatable(false).setSensable(true);
			appleGyroSensor.getProperties().add(propXGyro1);
			Property propYGyro1 = new Property("Y_GYRO");
			propYGyro1.setPropertyType(PropertyType.DOUBLE);
			propYGyro1.setActuatable(false).setSensable(true);
			appleGyroSensor.getProperties().add(propYGyro1);
			Property propZGyro1 = new Property("Z_GYRO");
			propZGyro1.setPropertyType(PropertyType.DOUBLE);
			propZGyro1.setActuatable(false).setSensable(true);
			appleGyroSensor.getProperties().add(propZGyro1);

			appleGyroSensor = getOrCreateThingType(appleGyroSensor, existing);
		}

		ThingType wpsSensor = new ThingType("Wireless Positioning System (WPS)");
		{
			wpsSensor.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("https://www.newbrandanalytics.com/blog/wp-content/uploads/2013/12/black-wifi-icon-hi-2.png"))
							.withContentType("image/png")));
			wpsSensor.setDescription("Wi-Fi network identification for localization. "
					+ "This is called a Wi-Fi Positioning System (WPS). "
					+ "The access points name and signal strength is determined and looked "
					+ "up in a database to identify the location. The more access points are "
					+ "found, the more precise the localization..");
			wpsSensor.addTag("wireless");
			wpsSensor.addTag("position");
			wpsSensor.addTag("location");
			Property propLat = new Property("latitude");
			propLat.setPropertyType(PropertyType.LOCATION_LAT);
			propLat.setActuatable(false).setSensable(true);
			Property propLon = new Property("longitude");
			propLon.setPropertyType(PropertyType.LOCATION_LON);
			propLon.setActuatable(false).setSensable(true);
			Property propLoc = new Property("location");
			propLoc.setPropertyType(PropertyType.LOCATION);
			propLoc.setActuatable(false).setSensable(true);
			propLoc.addChild(propLat);
			propLoc.addChild(propLon);
			wpsSensor.getProperties().add(propLoc);

			wpsSensor = getOrCreateThingType(wpsSensor, existing);
		}

		{
			ThingType appleMacBook = new ThingType("Apple Macbook Pro");
			appleMacBook.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("http://www1.pcmag.com/media/images/365183-apple-macbook-pro-13-inch-retina-2014.jpg"))
							.withContentType("image/jpeg")));
			appleMacBook.setDescription("Apple's Macbook laptop with integrated sensors.");
			appleMacBook.addTag("computer");
			appleMacBook.addTag("laptop");
			appleMacBook.addChild(appleGyroSensor.getId());
			appleMacBook.addChild(wpsSensor.getId());

			getOrCreateThingType(appleMacBook, existing);
		}

		ThingType batterySensor = new ThingType("MM9Z1J638 Battery Sensor");
		{
			batterySensor.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("http://www.engineerlive.com/sites/default/files/styles/article/public/eee%20sensors%20may14%20freescale.jpg?itok=9RL_D_e4"))
							.withContentType("image/jpeg")));
			batterySensor.setDescription("Designed to support both conventional and "
					+ "emerging battery chemistries for automotive and industrial applications, "
					+ "the MM9Z1J638 battery sensor measures key battery parameters for monitoring "
					+ "state of health (SOH), state of charge (SOC) and state of function (SOF) "
					+ "for early failure prediction. A flexible four-cell front end architecture "
					+ "supports conventional 12V lead acid batteries as well as emerging battery "
					+ "applications, such as 14V stacked cell Li-Ion, high voltage junction boxes, "
					+ "and 24V truck batteries.");
			batterySensor.addTag("battery");
			batterySensor.addTag("power");
			Property propBat = new Property("batteryPercent");
			propBat.setPropertyType(PropertyType.DOUBLE);
			propBat.setValueDomain(new ValueDomainContinuous<Double>(0.0, 100.0));
			propBat.setActuatable(false).setSensable(true);
			batterySensor.getProperties().add(propBat);

			batterySensor = getOrCreateThingType(batterySensor, existing);
		}

		ThingType pressureSensor = new ThingType("Oro-Tek™ Tire Pressure Sensor");
		{
			pressureSensor.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("http://www.carid.com/images/oro-tek/tpms-sensors/oro-tek-tpms-sensor.jpg"))
							.withContentType("image/jpeg")));
			pressureSensor.setDescription("Sensor for monitoring tire pressure.");
			pressureSensor.addTag("pressure");
			pressureSensor.addTag("bar");
			Property propBat = new Property("pressure");
			propBat.setPropertyType(PropertyType.DOUBLE);
			propBat.setUnit("bar");
			propBat.setValueDomain(new ValueDomainContinuous<Double>(0.0, 6.0));
			propBat.setActuatable(false).setSensable(true);
			pressureSensor.getProperties().add(propBat);

			pressureSensor = getOrCreateThingType(pressureSensor, existing);
		}

		{
			ThingType golfCart = new ThingType("Yamaha DRIVE Golf Car");

			golfCart.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("http://www.franksgolfcarts.com/images/yamaha2.png"))
							.withContentType("image/png")));
			golfCart.setDescription("Deep in the DNA of The DRIVE® is everything "
					+ "we’ve learned from our motorcycles, ATV’s and watercraft, "
					+ "including the ability to build with fewer parts, which leads "
					+ "to lighter weight, which leads to superior hill-climbing ability, "
					+ "a virtually greaseless chassis and the lowest maintenance costs in the industry.");
			golfCart.addTag("golf");
			golfCart.addTag("car");
			golfCart.addTag("cart");
			golfCart.addTag("vehicle");
			golfCart.addTag("traffic");
			golfCart.addChild(gpsSensor.getId());
			golfCart.addChild(batterySensor.getId());
			golfCart.addChild(pressureSensor.getId());
			golfCart.addChild(temperatureSensor.getId());

			golfCart = getOrCreateThingType(golfCart, existing);
		}

		{
			ThingType clubCar = new ThingType("Club Car Precedent i2 Golf Car");
			clubCar.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("http://www.jeffreyalleninc.com/userfiles/images/Prec%204%20Pass.jpg"))
							.withContentType("image/png")));
			clubCar.setDescription("Up to 4 passengers can enjoy the unique sense of "
					+ "style, quality, durability, and reliability that only "
					+ "Club Car golf car can provide with the Precedent 4-Passenger. "
					+ "New features make it more efficient and capable than ever — "
					+ "and it’s all designed with you in mind.");
			clubCar.addTag("golf");
			clubCar.addTag("car");
			clubCar.addTag("cart");
			clubCar.addTag("vehicle");
			clubCar.addTag("traffic");
			clubCar.addChild(gpsSensor.getId());
			clubCar.addChild(batterySensor.getId());
			clubCar.addChild(pressureSensor.getId());
			clubCar.addChild(temperatureSensor.getId());

			clubCar = getOrCreateThingType(clubCar, existing);
		}

		{
			ThingType dibox = new ThingType("DiBOX");
			dibox.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl("https://www.dibox.at/media/InfoWithPhone_Image_Component/" +
									"1-111-image/dh-500-be34a7/e32d4bb9/1416387299/iphone6_%2B_dibox_500x800_2x.png"))
							.withContentType("image/png")));

			dibox.setDescription("Wie ein Pulsmesser und eine Lauf-App es ermöglichen, Laufverhalten und Fitnesslevel " +
					"zu analysieren, kann mit der DiBOX und der gleichnamigen App* jederzeit der Fahrzeugstatus und das" +
					" individuelle Fahrverhalten abgefragt werden. Sind die Türen und Fenster zu? Ist das Licht aus?" +
					" Und muss ich heute noch tanken? All diese Fragen beantwortet die DiBOX auf einen Blick. Doch das" +
					" ist erst der Anfang.");

			dibox.addTag("telemetry");
			dibox.addTag("car");
			dibox.addTag("vw");
			dibox.addTag("vehicle");
			dibox.addTag("traffic");
			dibox.addChild(gpsSensor.getId());
			dibox.addChild(batterySensor.getId());
			dibox.addChild(pressureSensor.getId());
			dibox.addChild(temperatureSensor.getId());
			dibox = getOrCreateThingType(dibox, existing);
		}

		{
			ThingType emissionTester = new ThingType("BrainBee TechMobil 800+ Emission Tester");
			emissionTester.withImageData(Arrays.asList(
					new ImageData()
							.withBase64String(getBase64ImageFromUrl(
									"http://www.werkzeugeonline.eu/media/catalog/product/cache/1/image/1f5f7cd1de397160c99ff8bb04c50d3e/b/r/brainbee_techmobil_800.jpg"))
							.withContentType("image/png")));
			emissionTester.setDescription("Motor vehicle emissions "
					+ "and performance tester for petrol and diesel vehicles.");
			emissionTester.addTag("tester");
			emissionTester.addTag("temperature");
			emissionTester.addTag("emission");
			emissionTester.addTag("rotation");

			Property propTemp = new Property("temperature");
			propTemp.setPropertyType(PropertyType.DOUBLE);
			propTemp.setUnit("Celsius");
			propTemp.setActuatable(false).setSensable(true);
			emissionTester.getProperties().add(propTemp);
			Property propRot = new Property("rotation");
			propRot.setPropertyType(PropertyType.DOUBLE);
			propRot.setUnit("rotations/s");
			propRot.setActuatable(false).setSensable(true);
			emissionTester.getProperties().add(propRot);

			emissionTester = getOrCreateThingType(emissionTester, existing);
		}
	}

	private String getBase64ImageFromUrl(String urlHref) throws IOException {
		URL imageUrl = new URL(urlHref);
		byte[] imageBytes = IOUtils.toByteArray(imageUrl.openStream());
		return new String(Base64.encodeBase64(imageBytes));
	}


}