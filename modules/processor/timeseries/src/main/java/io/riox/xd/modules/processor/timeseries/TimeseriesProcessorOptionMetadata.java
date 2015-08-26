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

import io.riox.xd.modules.processor.timeseries.WekaTimeSeries.ClassifierType;

import org.hibernate.validator.constraints.NotBlank;
import org.springframework.xd.module.options.spi.ModuleOption;

/**
 * Module options for the {@code timeseries} sink module
 *
 * @author: Waldemar Hummer
 */
public class TimeseriesProcessorOptionMetadata {

	// Settings

	private volatile String interval = "1";

	private volatile String field = "value";

	private volatile Double min = null;

	private volatile ClassifierType type = ClassifierType.GAUSSIAN_PROCESSES;

	private volatile Boolean append = false;

	@NotBlank
	public String getInterval() {
		return interval;
	}

	@ModuleOption("Prediction interval, e.g., '3' -> 3 items into the future. Default: '1'")
	public void setInterval(String interval) {
		this.interval = interval;
	}
	
	public String getField() {
		return field;
	}

	@ModuleOption("The payload field used for prediction. By default, all numeric payload fields are forecast.")
	public void setField(String field) {
		this.field = field;
	}
	
	public Double getMin() {
		return min;
	}
	
	@ModuleOption("Minimum value to apply. Prevents the forecast to get out of range (e.g., negative values).")
	public void setMin(Double min) {
		this.min = min;
	}

	public ClassifierType getType() {
		return type;
	}

	@ModuleOption("Underlying classifier type used for forecasting. Valid options: 'GAUSSIAN_PROCESSES' (default), 'LINEAR_REGRESSION'.")
	public void setType(ClassifierType type) {
		this.type = type;
	}

	public Boolean getAppend() {
		return append;
	}
	
	@ModuleOption("Whether to append the prediction values to the incoming document (append=true) or send only the prediction values (append=false).")
	public void setAppend(Boolean append) {
		this.append = append;
	}
}
