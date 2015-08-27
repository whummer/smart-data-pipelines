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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.minidev.json.parser.JSONParser;

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

	private final WekaTimeSeries timeseries = new WekaTimeSeries();

	public String transform(String payload) {
		Map<String, Object> result = processMessage(payload);
		JsonBuilder builder = new JsonBuilder(result);
		return builder.toString();
	}

	public Map<String, Object> transform(Map<String, Object> payload) {
		return processMessage(payload);
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> processMessage(String payload) {
		try {
			JSONParser json = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);
			return processMessage((Map<String, Object>)json.parse(payload));
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	private boolean doAppend() {
		return append != null && append;
	}

	private Map<String, Object> processMessage(Map<String, Object> payload) {
		//System.out.println("payload " + payload + " - " + interval);
		timeseries.addInstance(payload);
		List<Map<String,Object>> list = timeseries.forecast(getNumSteps());
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
			this.timeseries.setForecastFields(this.field);
		}
	}

	public void setMin(Double min) {
		this.min = min;
		this.timeseries.setMinimumValue(this.min);
	}
	
	public void setType(ClassifierType type) {
		this.type = type;
		this.timeseries.setType(this.type);
	}
}
