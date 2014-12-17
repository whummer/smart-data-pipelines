package io.riots.core.model.driver;

import io.riots.core.model.BaseObjectCreated;
import io.riots.core.model.DeviceType;
import io.riots.services.model.Constants;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Represents a device driver, i.e., a component that
 * bridges the virtual device properties to real signals 
 * and operations in the real world.
 * 
 * @author Waldemar Hummer
 */
@JsonSubTypes({
	@Type(value = DeviceDriver.class, name="GENERIC"),
	@Type(value = DeviceDriverMQTT.class, name="MQTT"),
	@Type(value = DeviceDriver.DeviceDriverXively.class, name="XIVELY"),
	@Type(value = DeviceDriver.DeviceDriverSpark.class, name="SPARK_IO"),
	@Type(value = DeviceDriver.DeviceDriverCoAP.class, name="CoAP"),
	@Type(value = DeviceDriver.DeviceDriverXMPP.class, name="XMPP"),
	@Type(value = DeviceDriver.DeviceDriverREST.class, name="REST"),
	@Type(value = DeviceDriver.DeviceDriverAMQP.class, name="AMQP"),
	@Type(value = DeviceDriver.DeviceDriverDDS.class, name="DDS")
})
@JsonTypeInfo(
		use = JsonTypeInfo.Id.NAME,
		include = JsonTypeInfo.As.PROPERTY,
		property = "connector"
)
@Document(collection = Constants.COLL_DEVICE_DRIVERS)
public class DeviceDriver extends BaseObjectCreated<DeviceDriver> {

	/**
	 * Target device type for which this driver is applicable.
	 */
	@DBRef
	DeviceType deviceType;

	/**
	 * Connector type, e.g., a specific protocol like MQTT
	 * or a specific platform like Xively.
	 */
	DriverConnector connector;

	/**
	 * Programming language in which the driver should be exported.
	 */
	DriverLanguage driverLanguage;

	{
		/* default connector */
		connector = DriverConnector.GENERIC;
	}

	public static enum DriverConnector {
		GENERIC,

		XIVELY,
		SPARK_IO,

		MQTT,
		CoAP,
		XMPP,
		REST,
		AMQP,
		DDS
	}

	public static enum DriverLanguage {
		C,
		JAVA,
		PYTHON
	}

	public static class DeviceDriverSpark extends DeviceDriver {
		{ connector = DriverConnector.SPARK_IO; }
	}
	public static class DeviceDriverCoAP extends DeviceDriver {
		{ connector = DriverConnector.CoAP; }
	}
	public static class DeviceDriverMQTT extends DeviceDriver {
		{ connector = DriverConnector.MQTT; }
	}
	public static class DeviceDriverXMPP extends DeviceDriver {
		{ connector = DriverConnector.XMPP; }
	}
	public static class DeviceDriverXively extends DeviceDriver {
		{ connector = DriverConnector.XIVELY; }
	}
	public static class DeviceDriverDDS extends DeviceDriver {
		{ connector = DriverConnector.DDS; }
	}
	public static class DeviceDriverAMQP extends DeviceDriver {
		{ connector = DriverConnector.AMQP; }
	}
	public static class DeviceDriverREST extends DeviceDriver {
		{ connector = DriverConnector.REST; }
	}

	public DeviceType getDeviceType() {
		return deviceType;
	}
	public DriverConnector getConnector() {
		return connector;
	}
	public DriverLanguage getDriverLanguage() {
		return driverLanguage;
	}
}
