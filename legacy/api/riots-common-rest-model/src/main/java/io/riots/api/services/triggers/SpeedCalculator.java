package io.riots.api.services.triggers;

import io.riots.api.services.model.Constants;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Calculates the current speed of a moving thing.
 * @author whummer
 */
public class SpeedCalculator extends Trigger {
	{
		type = TriggerType.SPEED_CALCULATOR;
	}

	/**
	 * Thing to watch for speed.
	 */
	@JsonProperty(Constants.THING_ID)
	private String thingId;

	public String getThingId() {
		return thingId;
	}

	@Override
	public String toString() {
		return this.getClass().getSimpleName() + "[id=" + id + 
				", created=" + created + ", creatorId=" + creatorId + "]";
	}

}