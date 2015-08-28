package io.riox.xd.modules.processor.aggregator;

import io.riox.xd.modules.processor.aggregator.AggregatorMessageHandler.AggregationType;

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class DocAggregator {

	public static double aggregate(AggregationType type,
			Collection<Map<String, Object>> docs, String field) {
		if(type == AggregationType.MIN) {
			return aggregateMIN(docs, field);
		} else if(type == AggregationType.MAX) {
			return aggregateMAX(docs, field);
		} else if(type == AggregationType.MAX) {
			return aggregateSUM(docs, field);
		}
		throw new RuntimeException("Invalid aggregation type " + field);
	}

	public static double aggregateMIN(Collection<Map<String, Object>> docs, String field) {
		List<Double> collected = collect(docs, field);
		if(collected.isEmpty()) return Double.NaN;
		Collections.sort(collected);
		return collected.get(0);
	}
	public static double aggregateMAX(Collection<Map<String, Object>> docs, String field) {
		List<Double> collected = collect(docs, field);
		if(collected.isEmpty()) return Double.NaN;
		Collections.sort(collected);
		return collected.get(collected.size() - 1);
	}
	public static double aggregateSUM(Collection<Map<String, Object>> docs, String field) {
		List<Double> collected = collect(docs, field);
		double sum = 0;
		for(double d : collected) {
			sum += d;
		}
		return sum;
	}

	public static List<Double> collect(Collection<Map<String, Object>> docs, String field) {
		List<Double> list = new LinkedList<Double>();
		for(Map<String, Object> doc : docs) {
			Double val = Double.parseDouble("" + doc.get(field));
			list.add(val);
		}
		return list;
	}

}
