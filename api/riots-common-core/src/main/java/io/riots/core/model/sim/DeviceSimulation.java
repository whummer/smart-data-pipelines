package io.riots.core.model.sim;

import io.riots.core.model.BaseObjectCreated;
import io.riots.core.model.Device;
import io.riots.core.model.DeviceType;
import io.riots.services.model.Constants;

import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Represents a device specification for a simulation. 
 * A device simulation is one of the following:
 *  - Device Group: List of devices of a special type
 *  - Device Instance: Reference to a concrete device instance
 * 
 * @author Waldemar Hummer
 */
@JsonSubTypes({
	@Type(value = DeviceSimulation.DeviceSimulationGroup.class, name=DeviceSimulation.TYPE_GROUP),
	@Type(value = DeviceSimulation.DeviceSimulationInstance.class, name=DeviceSimulation.TYPE_INSTANCE)
})
@JsonTypeInfo(
		use = JsonTypeInfo.Id.NAME,
		include = JsonTypeInfo.As.PROPERTY,
		property = "type"
)
@Document(collection = Constants.COLL_SIM_DEVICE_GROUPS)
public abstract class DeviceSimulation extends BaseObjectCreated<DeviceSimulation> {

	public static final String TYPE_GROUP = "GROUP";
	public static final String TYPE_INSTANCE = "INSTANCE";

	/**
	 * Concrete type to distinguish subclasses.
	 */
	protected String type;

	public static class DeviceSimulationGroup extends DeviceSimulation {
		private DeviceType deviceType;
		private int numInstances;

		{
			type = TYPE_GROUP;
		}

		public DeviceType getDeviceType() {
			return deviceType;
		}
		public void setDeviceType(DeviceType deviceType) {
			this.deviceType = deviceType;
		}
		public int getNumInstances() {
			return numInstances;
		}
		public void setNumInstances(int numInstances) {
			this.numInstances = numInstances;
		}
		@Override
		public String toString() {
			return "DeviceSimulationGroup [deviceType=" + deviceType
					+ ", numInstances=" + numInstances + "]";
		}
	}

	public static class DeviceSimulationInstance extends DeviceSimulation {
		private Device instance;

		{
			type = TYPE_INSTANCE;
		}

		public DeviceSimulationInstance() {}
		public DeviceSimulationInstance(Device instance) {
			this.instance = instance;
		}

		public Device getInstance() {
			return instance;
		}
		public void setInstance(Device instance) {
			this.instance = instance;
		}
		@Override
		public String toString() {
			return "DeviceSimulationInstance [instance=" + instance + "]";
		}
		
	}

}
