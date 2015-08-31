# Spring XD - Processor: Timeseries

Simple aggregate functions like max/min or sum of values.

## Options

* interval: Prediction interval, e.g., '3' -> 3 items into the future. Default: '1'
* field: The payload field used for prediction. By default, all numeric payload fields are forecast.
* min: Minimum value to apply. Prevents the forecast to get out of range (e.g., negative values).
* type: Underlying classifier type used for forecasting. Valid options: 'GAUSSIAN_PROCESSES' (default), 'LINEAR_REGRESSION'.
* append: Whether to append the prediction values to the incoming document (append=true) or send only the prediction values (append=false).
* discriminators: 	A comma-separated list of field names used as discriminators,
					for handling multiple timeseries predictions for arrays of incoming documents.
					E.g., if discriminators='id1,id2', then a separate prediction is started for each
					unique combination of values for the fields 'id1' and 'id2' in the incoming documents.

## Example

Given a sequence of source documents, e.g.:

```
{"id":1,"value":1}
{"id":1,"value":2}
{"id":2,"value":3}
{"id":2,"value":4}
```

... a timeseries processor with the following definition:

```
timeseries --interval=2 --field=value --min=0 --type=GAUSSIAN_PROCESSES --discriminators=id append=true
```

... would transform the latest document in the sequence into the following document (with similar prediction values):

```
{"id":2,"value":4,"_timeseries_prediction":[{"value":5.0},{"value":6.0}]}
```
