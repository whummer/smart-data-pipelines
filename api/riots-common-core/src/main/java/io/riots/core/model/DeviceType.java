package io.riots.core.model;

import io.riots.core.model.SemanticType.SemanticDeviceType;
import io.riots.core.util.cascade.CascadeSave;

import java.util.LinkedList;
import java.util.List;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * @author omoser
 * @author whummer
 */
@Document(collection = Constants.COLL_DEVICE_TYPES)
public class DeviceType extends AssetType<DeviceType> {

    public static final String CLASS_NAME = DeviceType.class.getCanonicalName();

	@DBRef
    private Manufacturer manufacturer;

    /**
     * Semantic type of this device, e.g., temperature sensor.
     */
    @DBRef
    private SemanticDeviceType semanticType;

	private String imageUrl;

    /**
     * Contains the list of properties that are "actuatable"
     * within this device. Actuatable properties are either 1)
     * sensable properties reported by a sensor device
     * (e.g., room temperature), or 2) actuatable properties
     * (e.g., temperature of a heater). A property can also
     * be both sensable and actuatable.
     */
    @DBRef
    @CascadeSave
    private List<Property<?>> deviceProperties = new LinkedList<Property<?>>();

    @JsonCreator
    public DeviceType() {
        super();
    }

    public DeviceType(String name) {
        super(name);
    }

	public Property<?> getDeviceProperty(String propertyName) {
		for(Property<?> p : deviceProperties) {
			if(p.getName() != null && p.getName().equals(propertyName)) {
				return p;
			}
		}
		return null;
	}

	/* HELPER METHODS */

    public DeviceType withManufacturer(final Manufacturer manufacturer) {
        this.manufacturer = manufacturer;
        return this;
    }

    public Manufacturer getManufacturer() {
        return manufacturer;
    }
    public void setManufacturer(Manufacturer manufacturer) {
		this.manufacturer = manufacturer;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public List<Property<?>> getDeviceProperties() {
		return deviceProperties;
	}
    public void setDeviceProperties(List<Property<?>> deviceProperties) {
		this.deviceProperties = deviceProperties;
	}

    public SemanticDeviceType getSemanticType() {
		return semanticType;
	}
    public void setSemanticType(SemanticDeviceType semanticType) {
		this.semanticType = semanticType;
	}

    @Override
	public String toString() {
		return "DeviceType [manufacturer=" + manufacturer +
				", deviceProperties=" + deviceProperties + "]";
	}

	@Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DeviceType)) return false;
        if (!super.equals(o)) return false;

        DeviceType that = (DeviceType) o;

        if (manufacturer != null ? !manufacturer.equals(that.manufacturer) : that.manufacturer != null) return false;
        if (deviceProperties.equals(that.deviceProperties)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (manufacturer != null ? manufacturer.hashCode() : 0);
        result = 31 * result + (deviceProperties != null ? deviceProperties.hashCode() : 0);
        return result;
    }

}
