/*
 * Copyright 2014 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.riox.xd.modules.processor.timeseries;

import groovy.json.JsonBuilder;
import io.riox.xd.modules.processor.timeseries.WekaTimeSeries.ClassifierType;

import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import net.minidev.json.parser.JSONParser;

import org.apache.commons.lang.NotImplementedException;
import org.apache.commons.lang.StringUtils;
import org.springframework.messaging.Message;

/**
 * MessageHandler implementation for time series analysis.
 *
 * @author: Waldemar Hummer
 */
public class TimeseriesMessageHandler {

	private static final int DEFAULT_NUM_STEPS = 1;
	private static final String KEY_RESULT = "_timeseries_prediction";

	/**
	 * Option "interval" (see {@link TimeseriesProcessorOptionMetadata})
	 */
	private volatile String interval;
	/**
	 * Option "field" (see {@link TimeseriesProcessorOptionMetadata})
	 */
	private volatile String field;
	/**
	 * Option "field" (see {@link TimeseriesProcessorOptionMetadata})
	 */
	private volatile Double min;
	/**
	 * Option "type" (see {@link TimeseriesProcessorOptionMetadata})
	 */
	private volatile ClassifierType type;
	/**
	 * Option "append" (see {@link TimeseriesProcessorOptionMetadata})
	 */
	private volatile Boolean append;
	/**
	 * Option "append" (see {@link TimeseriesProcessorOptionMetadata})
	 */
	private volatile String discriminators;

	private final Map<Discriminator,WekaTimeSeries> timeseries = new HashMap<Discriminator,WekaTimeSeries>();
	private final List<String> discriminatorFields = new LinkedList<String>();

	private static final class Discriminator {
		Map<String,Object> map = new HashMap<String,Object>();

		@Override
		public int hashCode() {
			final int prime = 31;
			int result = 1;
			result = prime * result + ((map == null) ? 0 : map.hashCode());
			return result;
		}

		@Override
		public boolean equals(Object obj) {
			if (this == obj)
				return true;
			if (obj == null)
				return false;
			if (getClass() != obj.getClass())
				return false;
			Discriminator other = (Discriminator) obj;
			if (map == null) {
				if (other.map != null)
					return false;
			} else if (!map.equals(other.map))
				return false;
			return true;
		}
	}

	@SuppressWarnings("all")
	public <T> T transform(Message<?> msg) {
		System.out.println("message: " + msg);
		System.out.println("message: " + msg.getClass());
		System.out.println(msg.getHeaders());
		System.out.println(msg.getPayload());
		Object payload = msg.getPayload();
		if(payload instanceof Map) {
			return (T) transform((Map)payload);
		} else if(payload instanceof List) {
			return (T) transform((List)payload);
		}

		throw new NotImplementedException();
	}

	public String transform(String payload) {
		Object result = processMessage(payload);
		JsonBuilder builder = new JsonBuilder(result);
		return builder.toString();
	}

	public Map<String, Object> transform(Map<String, Object> payload) {
		System.out.println("transform(Map) class: " + payload.getClass());
		return processMessage(payload);
	}

	public List<Map<String, Object>> transform(List<Map<String,Object>> payload) {
		System.out.println("transform(List) class: " + payload.getClass());
		return processMessage(payload);
	}

	@SuppressWarnings("all")
	private <T> T processMessage(String payload) {
		try {
			JSONParser json = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);
			Object obj = json.parse(payload);
			if(obj instanceof List) {
				return (T)processMessage((List)obj);
			} else if(obj instanceof Map) {
				return (T)processMessage((Map)obj);
			} else {
				throw new RuntimeException("Unexpected message received: " + obj);
			}
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	private boolean doAppend() {
		return append != null && append;
	}

	private Discriminator getDiscriminator(Map<String,Object> payload) {
		Discriminator d = new Discriminator();
		if(StringUtils.isEmpty(discriminators)) {
			return d;
		}
		for(String field : discriminatorFields) {
			d.map.put(field, payload.get(field));
		}
		return d;
	}

	private WekaTimeSeries getMatchingTimeseries(Map<String,Object> payload) {
		Discriminator d = getDiscriminator(payload);
		WekaTimeSeries existing = timeseries.get(d);
		if(existing == null) {
			existing = new WekaTimeSeries();
			timeseries.put(d, existing);
			applyAll();
		}
		return existing;
	}

	private List<Map<String,Object>> processMessage(List<Map<String,Object>> payload) {
		for(int i = 0; i < payload.size(); i ++) {
			payload.set(i, processMessage(payload.get(i)));
		}
		return payload;
	}

	private Map<String, Object> processMessage(Map<String, Object> payload) {
		//System.out.println("payload " + payload + " - " + interval);
		WekaTimeSeries series = getMatchingTimeseries(payload);
		series.addInstance(payload);
		List<Map<String,Object>> list = series.forecast(getNumSteps());
		Map<String, Object> result = doAppend() ? payload : new HashMap<String, Object>();
		result.put(KEY_RESULT, list);
		return result;
	}

	private int getNumSteps() {
		try {
			return Integer.parseInt(interval);
		} catch (Exception e) {
			return DEFAULT_NUM_STEPS; /* default value */
		}
	}

	/* APPLY methods */

	private void applyType() {
		for(WekaTimeSeries t : timeseries.values()) {
			t.setType(this.type);
		}
	}
	private void applyMin() {
		for(WekaTimeSeries t : timeseries.values()) {
			t.setMinimumValue(this.min);
		}
	}
	private void applyField() {
		for(WekaTimeSeries t : timeseries.values()) {
			t.setForecastFields(this.field);
		}
	}
	private void applyAll() {
		applyType();
		applyMin();
		applyField();
	}

	/* GETTERS / SETTERS */

	public void setInterval(String interval) {
		this.interval = interval;
	}

	public void setAppend(Boolean append) {
		this.append = append;
	}

	public void setField(String field) {
		this.field = field;
		if(this.field != null) {
			applyField();
		}
	}

	public void setMin(Double min) {
		this.min = min;
		applyMin();
	}

	public void setDiscriminators(String discriminators) {
		this.discriminators = discriminators;
		this.discriminatorFields.clear();
		if(discriminators != null) {
			this.discriminatorFields.addAll(Arrays.asList(
					discriminators.split("[\\s,]+")));
		}
	}

	public void setType(ClassifierType type) {
		this.type = type;
		applyType();
	}

}
