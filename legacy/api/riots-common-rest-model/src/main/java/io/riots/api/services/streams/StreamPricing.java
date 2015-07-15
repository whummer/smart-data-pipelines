package io.riots.api.services.streams;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Pricing model for data streams.
 * @author whummer
 */
public class StreamPricing {

	/**
	 * Billing Unit (e.g., data volume in MBytes).
	 */
	@JsonProperty
	BillingUnit billingUnit;
	/**
	 * Unit Size (e.g., 100 MBytes).
	 */
	@JsonProperty
	double unitSize;
	/**
	 * Price pear each size unit of the billing unit (e.g., 10$ for 100 MBytes).
	 */
	@JsonProperty
	double unitPrice;

}
