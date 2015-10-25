# Spring XD - Processor: Message Aggregator

Simple aggregate functions like max/min or sum of values.

## Options

* type - Type of aggregations to apply. Either of {SUM, MIN, MAX}
* field - Name of field to aggregate
* targetField - Name of target field to store the aggregation result. If null, a field name is automatically generated.
* groupBy - Name of field to group this aggregation by.
* discriminators - Comma-separated list of discriminator fields. These fields identify unique documents within a group.
* append - Whether to append the aggregate value to messages (=true) or return only the aggregate value (=false).

## Example

Given a sequence of source documents, e.g.:

```
{"group":"g1","id":1,"value":1}
{"group":"g2","id":1,"value":2}
{"group":"g1","id":2,"value":3}
{"group":"g2","id":2,"value":4}
```

... an aggregator with the following definition:

```
aggregate --type=SUM --field=value --targetField=sum --groupBy=group --discriminators=id append=true
```

... would transform the latest document in the sequence into the following document (sum is 2+4=6):

```
{"group":"g2","id":2,"value":4,"sum":6}
```
