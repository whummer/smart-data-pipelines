
module.exports = {
	counters : {
		'statsd.bad_lines_seen' : 0,
		'statsd.packets_received' : 18,
		'statsd.metrics_received' : 18,
		'status_code.200' : 9
	},
	timers : {
		response_time : [ 5, 6, 8, 8, 9, 9, 10, 12, 16 ]
	},
	gauges : {
		'statsd.timestamp_lag' : 0
	},
	timer_data : {
		response_time : {
			count_90 : 8,
			mean_90 : 8.375,
			upper_90 : 12,
			sum_90 : 67,
			sum_squares_90 : 595,
			std : 3.083208205669246,
			upper : 16,
			lower : 5,
			count : 9,
			count_ps : 0.9,
			sum : 83,
			sum_squares : 851,
			mean : 9.222222222222221,
			median : 9
		}
	},
	counter_rates : {
		'statsd.bad_lines_seen' : 0,
		'statsd.packets_received' : 1.8,
		'statsd.metrics_received' : 1.8,
		'status_code.200' : 0.9
	},
	sets : {},
	pctThreshold : [ 90 ]
};
