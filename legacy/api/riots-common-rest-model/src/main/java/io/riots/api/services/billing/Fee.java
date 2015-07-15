package io.riots.api.services.billing;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents a usage fee, amount in a currency, 
 * and .
 * @author whummer
 */
public class Fee {

	/**
	 * Amount of the fee.
	 */
	@JsonProperty
	double fee;
	/**
	 * Currency of the fee amount.
	 */
	@JsonProperty
	String currency;
	/**
	 * Period for which this fee applies, e.g., 
	 * monthly, weekly, daily, hourly.
	 */
	@JsonProperty
	TimePeriod period;

}
