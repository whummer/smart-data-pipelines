package io.riots.api.services.billing;


/**
 * Time periods used for billing and user action limits.
 * @author whummer
 */
public enum TimePeriod {

	YEARLY,
	MONTHLY,
	WEEKLY,
	DAILY,
	HOURLY,

	PER_SECOND,

	BILLING_PERIOD,
	OVERALL;
	
}
