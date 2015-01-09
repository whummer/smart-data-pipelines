package io.riots.services.triggers;

import io.riots.services.model.Location;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents a geo-fence in the platform.
 * @author whummer
 */
public class GeoFence extends Trigger {
	{
		type = TriggerType.GEO_FENCE;
	}

	/**
	 * Center location of the geo fence.
	 */
	@JsonProperty
	private Location center;

	/**
	 * Diameter of the geo fence.
	 */
	@JsonProperty
	private double diameter;

	public Location getCenter() {
		return center;
	}
	public double getDiameter() {
		return diameter;
	}

	@Override
	public String toString() {
		return "GeoFence [id=" + id + ", created=" + created + ", creatorId="
				+ creatorId + ", center=" + center + ", diameter=" + diameter
				+ "]";
	}

}