package io.riots.api.services.streams;

/**
 * Billing Units.
 */
public enum BillingUnit {

	/* None (free of charge) */
	NONE,

	/* Time-based billing units */
	TIME_MS, TIME_SEC, TIME_MIN, TIME_H, TIME_DAY, TIME_WEEK, TIME_MONTH, TIME_YEAR,

	/* Data volume based billing units */
	VOL_B, VOL_KB, VOL_MB, VOL_GB, VOL_TB,

	/* Event-based */
	PER_EVENT

}
