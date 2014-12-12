package io.riots.core.model.demo;

import io.riots.core.model.DeviceType;
import io.riots.core.model.Manufacturer;
import io.riots.core.model.Property.PropertyBoolean;
import io.riots.core.model.Property.PropertyDouble;
import io.riots.core.model.Property.PropertyList;
import io.riots.core.model.Property.PropertyLong;
import io.riots.core.model.SemanticType;
import io.riots.core.model.SemanticType.SemanticDeviceType;
import io.riots.core.model.SemanticType.SemanticDeviceType.PredefinedDevTypes;
import io.riots.core.model.SemanticType.SemanticPropertyType;
import io.riots.core.model.SemanticType.SemanticPropertyType.PredefinedPropTypes;
import io.riots.core.model.ValueDomainContinuous;
import io.riots.core.model.ValueDomainDiscrete;
import io.riots.core.model.ValueDomainEnumerated;
import io.riots.core.repositories.BaseObjectCategorizedRepository;
import io.riots.core.repositories.DeviceTypeRepository;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class DemoData {

	static boolean inserted = false;

	private static Map<String, SemanticPropertyType> propTypes = new HashMap<>();
	private static Map<String, SemanticDeviceType> devTypes = new HashMap<>();

	public static void insertData(
			DeviceTypeRepository devRepo,
			BaseObjectCategorizedRepository<?> baseRepo) {
		if (inserted)
			return;
		insertPropData(baseRepo);
		insertDevData(baseRepo);
		insertManufacturerData(baseRepo);
		insertDeviceData(devRepo);
		inserted = true;
	}

	private static void insertDeviceData(DeviceTypeRepository devRepo) {
		for(DeviceType t : getDeviceData()) {
			List<DeviceType> types = devRepo.findByNameLike(t.getName());
			if(types.isEmpty()) {
				devRepo.save(t);
			}
		}
	}
	@SuppressWarnings("all")
	private static void insertManufacturerData(BaseObjectCategorizedRepository baseRepo) {
		for(Manufacturer t : getManufacturers()) {
			List<?> types = baseRepo.findByCategoryAndName(t.getCategory(), t.getName());
			if(types.isEmpty()) {
				t = (Manufacturer)baseRepo.save(t);
			}
		}
	}
	@SuppressWarnings("all")
	private static void insertPropData(BaseObjectCategorizedRepository baseRepo) {
		insertData(getPropTypes(), baseRepo);
	}
	@SuppressWarnings("all")
	private static void insertDevData(BaseObjectCategorizedRepository baseRepo) {
		insertData(getDevTypes(), baseRepo);
	}
	@SuppressWarnings("all")
	private static void insertData(List<SemanticType> list, BaseObjectCategorizedRepository baseRepo) {
		for(SemanticType t : list) {
			List<SemanticType> types = baseRepo.findByCategoryAndName(t.getCategory(), t.getName());
			if(types.isEmpty()) {
				t = (SemanticType)baseRepo.save(t);
				if(t instanceof SemanticPropertyType)
					propTypes.put(t.getName(), (SemanticPropertyType)t);
				if(t instanceof SemanticDeviceType)
					devTypes.put(t.getName(), (SemanticDeviceType)t);
			}
		}
	}

	public static List<SemanticType> getPropTypes() {
		List<SemanticType> list = new LinkedList<>();
		for(PredefinedPropTypes t : PredefinedPropTypes.values()) {
			list.add(new SemanticType.SemanticPropertyType(t.name()));
		}
		return list;
	}

	public static List<SemanticType> getDevTypes() {
		List<SemanticType> list = new LinkedList<>();
		for(PredefinedDevTypes t : PredefinedDevTypes.values()) {
			list.add(new SemanticType.SemanticDeviceType(t.name()));
		}
		return list;
	}

	public static List<Manufacturer> getManufacturers() {
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

	public static List<DeviceType> getDeviceData() {

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
		PropertyDouble propDist = new PropertyDouble("distance");
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
		PropertyBoolean propMotion = new PropertyBoolean("motion");
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
		PropertyDouble propTemp = new PropertyDouble("temperature");
		propTemp.setSemanticType(propTypes.get(PredefinedPropTypes.temperature.toString()));
		propTemp.setValueDomain(new ValueDomainDiscrete<>(-15.0, 70.0, 0.1));
		propTemp.getMetadata().setActuatable(false).setSensable(true);
		temperatureSensor.getDeviceProperties().add(propTemp);

		DeviceType raspiBPlus = new DeviceType("Raspberry Pi Model B+")
				.withDescription("512MB RAM, new GPIO, microSD")
				.addChild(motionSensor)
				.addChild(temperatureSensor).addChild(ultraSoniceSensor);
		PropertyLong propGPU = new PropertyLong("GPU_MEM");
		propGPU.setValueDomain(new ValueDomainDiscrete<>(16L, 448L, 1L));
		propGPU.getMetadata().setActuatable(true).setSensable(true);
		raspiBPlus.getDeviceProperties().add(propGPU);
		PropertyLong propSDTV = new PropertyLong("SDTV_MODE");
		propSDTV.setValueDomain(new ValueDomainEnumerated<Long>(0L,1L,2L,3L));
		propSDTV.getMetadata().setActuatable(true).setSensable(true);
		raspiBPlus.getDeviceProperties().add(propSDTV);
		PropertyLong propHDMI = new PropertyLong("HDMI_MODE");
		propHDMI.setValueDomain(new ValueDomainDiscrete<Long>(0L,59L,1L));
		propHDMI.getMetadata().setActuatable(true).setSensable(true);
		raspiBPlus.getDeviceProperties().add(propHDMI);
		PropertyLong propFB = new PropertyLong("FRAMEBUFFER_DEPTH");
		propFB.setValueDomain(new ValueDomainEnumerated<Long>(8L,16L,24L,32L));
		propFB.getMetadata().setActuatable(true).setSensable(true);
		raspiBPlus.getDeviceProperties().add(propFB);

		DeviceType ismartSensor = new DeviceType("iSmart Alarm")
				.withDescription("Wireless motion detector");
		PropertyBoolean propMotion1 = new PropertyBoolean("motion");
		propMotion1.getMetadata().setActuatable(false).setSensable(true);
		propMotion1.setValueDomain(new ValueDomainEnumerated<Boolean>(true, false));
		ismartSensor.getDeviceProperties().add(propMotion1);

		DeviceType waterSensor = new DeviceType("AQUAlogger 210PTdeep")
				.withDescription("Deep water data logger that measures "
						+ "and records temperature and pressure");
		PropertyDouble propPressure = new PropertyDouble("pressure");
		propPressure.setValueDomain(new ValueDomainDiscrete<>(0.0, 100.0, 0.01));
		propPressure.getMetadata().setActuatable(true).setSensable(true);
		propPressure.setSemanticType(propTypes.get(PredefinedPropTypes.pressure.toString()));
		waterSensor.getDeviceProperties().add(propPressure);
		PropertyDouble propTemp1 = new PropertyDouble("temperature");
		propTemp1.setValueDomain(new ValueDomainDiscrete<>(-2.0, 30.0, 0.05));
		propTemp1.getMetadata().setActuatable(true).setSensable(true);
		propTemp1.setSemanticType(propTypes.get(PredefinedPropTypes.temperature.toString()));
		waterSensor.getDeviceProperties().add(propTemp1);

		DeviceType gyroSensor = new DeviceType("MPU-6000 Six Axis Motion Tracker")
				.withDescription("Motion tracking device which is a combination of a "
						+ "3-axis gyroscope and a 3-axis accelerometer "
						+ "with an onboard Digital Motion Processor™, "
						+ "which can also access other external sensors");
		PropertyDouble propXAccel = new PropertyDouble("X_ACCEL");
		propXAccel.getMetadata().setActuatable(false).setSensable(true);
		gyroSensor.getDeviceProperties().add(propXAccel);
		PropertyDouble propYAccel = new PropertyDouble("Y_ACCEL");
		propYAccel.getMetadata().setActuatable(false).setSensable(true);
		gyroSensor.getDeviceProperties().add(propYAccel);
		PropertyDouble propZAccel = new PropertyDouble("Z_ACCEL");
		propZAccel.getMetadata().setActuatable(false).setSensable(true);
		gyroSensor.getDeviceProperties().add(propZAccel);
		PropertyDouble propXGyro = new PropertyDouble("X_GYRO");
		propXGyro.getMetadata().setActuatable(false).setSensable(true);
		gyroSensor.getDeviceProperties().add(propXGyro);
		PropertyDouble propYGyro = new PropertyDouble("Y_GYRO");
		propYGyro.getMetadata().setActuatable(false).setSensable(true);
		gyroSensor.getDeviceProperties().add(propYGyro);
		PropertyDouble propZGyro = new PropertyDouble("Z_GYRO");
		propZGyro.getMetadata().setActuatable(false).setSensable(true);
		gyroSensor.getDeviceProperties().add(propZGyro);

		DeviceType gpsSensor = new DeviceType("EM-506 GPS Receiver")
				.withDescription("EM-506 includes on-board voltage regulation, "
						+ "LED status indicator, battery backed RAM, "
						+ "and a built-in patch antenna. 6-pin interface cable included.");
		gpsSensor.setSemanticType(devTypes.get(PredefinedDevTypes.Location_Sensor.toString()));
		PropertyDouble propLat = new PropertyDouble("latitude");
		propLat.getMetadata().setActuatable(false).setSensable(true);
		propLat.setSemanticType(propTypes.get(PredefinedPropTypes.location_lat.toString()));
		PropertyDouble propLon = new PropertyDouble("longitude");
		propLon.setSemanticType(propTypes.get(PredefinedPropTypes.location_lon.toString()));
		propLon.getMetadata().setActuatable(false).setSensable(true);
		PropertyList propLoc = new PropertyList("location");
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
