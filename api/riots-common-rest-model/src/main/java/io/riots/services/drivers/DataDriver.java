package io.riots.services.drivers;

import io.riots.services.model.interfaces.ObjectCreated;
import io.riots.services.model.interfaces.ObjectIdentifiable;

import java.util.Date;

import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
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
	@Type(value = DataDriver.DataDriverREST.class, name="RIOTS_REST"),
	@Type(value = DataDriverSimulation.class, name="RIOTS_SIMULATION"),
	@Type(value = DataDriverMQTT.class, name="MQTT"),
	@Type(value = DataDriver.DataDriverXively.class, name="XIVELY"),
	@Type(value = DataDriver.DataDriverSpark.class, name="SPARK_IO"),
	@Type(value = DataDriver.DataDriverCoAP.class, name="CoAP"),
	@Type(value = DataDriver.DataDriverXMPP.class, name="XMPP"),
	@Type(value = DataDriver.DataDriverAMQP.class, name="AMQP"),
	@Type(value = DataDriver.DataDriverDDS.class, name="DDS")
})
@JsonTypeInfo(
		use = JsonTypeInfo.Id.NAME,
		include = JsonTypeInfo.As.PROPERTY,
		property = "connector"
)
public class DataDriver implements ObjectIdentifiable, ObjectCreated {

	/**
	 * Identifier.
	 */
	@JsonProperty
	String id;

	/**
	 * Creation Date.
	 */
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creation-date")
	@Field(type = FieldType.Date)
	private Date created;

	/**
	 * Creating user id.
	 */
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("creator-id")
	private String creatorId;

	/**
	 * Target thing type for which this driver is applicable.
	 */
	@JsonProperty
	String thingTypeId;

	/**
	 * Target thing for which this driver is applicable.
	 */
	@JsonProperty
	String thingId;

	/**
	 * Target thing's property name for which this driver is applicable.
	 */
	@JsonProperty
	String propertyName;

	/**
	 * Connector type, e.g., a specific protocol like MQTT
	 * or a specific platform like Xively.
	 */
	@JsonProperty
	DriverConnector connector;

	/**
	 * Programming language in which the driver should be exported.
	 * TODO: whummer: needed?
	 */
	@JsonProperty
	DriverLanguage driverLanguage;

	{
		/* default connector */
		connector = DriverConnector.RIOTS_REST;
	}

	public static enum DriverConnector {
		RIOTS_REST,
		RIOTS_SIMULATION,

		XIVELY,
		SPARK_IO,

		MQTT,
		CoAP,
		XMPP,
		AMQP,
		DDS
	}

	public static enum DriverLanguage {
		C,
		JAVA,
		PYTHON
	}

	public static class DataDriverSpark extends DataDriver {
		{ connector = DriverConnector.SPARK_IO; }
	}
	public static class DataDriverCoAP extends DataDriver {
		{ connector = DriverConnector.CoAP; }
	}
	public static class DataDriverXMPP extends DataDriver {
		{ connector = DriverConnector.XMPP; }
	}
	public static class DataDriverXively extends DataDriver {
		{ connector = DriverConnector.XIVELY; }
	}
	public static class DataDriverDDS extends DataDriver {
		{ connector = DriverConnector.DDS; }
	}
	public static class DataDriverAMQP extends DataDriver {
		{ connector = DriverConnector.AMQP; }
	}
	public static class DataDriverREST extends DataDriver {
		{ connector = DriverConnector.RIOTS_REST; }
	}

	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}

	public Date getCreated() {
		return created;
	}
	public void setCreated(Date created) {
		this.created = created;
	}
	public String getCreatorId() {
		return creatorId;
	}
	public void setCreatorId(String creatorId) {
		this.creatorId = creatorId;
	}

	public String getThingId() {
		return thingId;
	}
	public void setThingId(String thingId) {
		this.thingId = thingId;
	}
	public String getThingTypeId() {
		return thingTypeId;
	}
	public void setThingTypeId(String thingTypeId) {
		this.thingTypeId = thingTypeId;
	}
	public String getPropertyName() {
		return propertyName;
	}
	public void setPropertyName(String propertyName) {
		this.propertyName = propertyName;
	}

	public DriverConnector getConnector() {
		return connector;
	}
	public DriverLanguage getDriverLanguage() {
		return driverLanguage;
	}

}
