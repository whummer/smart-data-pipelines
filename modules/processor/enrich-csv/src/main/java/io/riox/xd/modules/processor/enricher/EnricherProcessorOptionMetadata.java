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

package io.riox.xd.modules.processor.enricher;

import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotBlank;
import org.springframework.xd.module.options.spi.ModuleOption;

/**
 * Module options for the {@code enricher} processor module
 *
 * @author: Waldemar Hummer
 */
public class EnricherProcessorOptionMetadata {

	private volatile String url;

	private volatile Integer cache = -1;

	private volatile Boolean overwrite = false;

	private volatile Boolean flat = true;

	private volatile String columns = null;

	private volatile String sourceID = null;

	private volatile String targetID = null;

	private volatile String mappings = null;

	private volatile String preMap = null;

	@NotNull
	public Integer getCache() {
		return cache;
	}

	@ModuleOption("Number of seconds to cache data, or -1 to cache indefinitely. Default: -1")
	public void setCache(Integer cache) {
		this.cache = cache;
	}

	@NotBlank
	public String getUrl() {
		return url;
	}

	@ModuleOption("URL of the data to fetch for enriching.")
	public void setUrl(String url) {
		this.url = url;
	}

	public Boolean getOverwrite() {
		return overwrite;
	}

	@ModuleOption("Wether to overwrite existing fields in the target document. If false, prefix field names with '_' to avoid collision. Default: false")
	public void setOverwrite(Boolean overwrite) {
		this.overwrite = overwrite;
	}

	public Boolean getFlat() {
		return flat;
	}

	@ModuleOption("Whether to put the CSV data top-level into the document (CSV columns become top-level document fields). If false, puts the CSV result into a new field. Default: true")
	public void setFlat(Boolean flat) {
		this.flat = flat;
	}

	public String getColumns() {
		return columns;
	}

	@ModuleOption("Comma-separated list of column names. If empty, first row of CSV is used as column names. Default: null")
	public void setColumns(String columns) {
		this.columns = columns;
	}

	public String getSourceID() {
		return sourceID;
	}

	@ModuleOption("Name of the discriminator field on the source (e.g., column name of CSV file).")
	public void setSourceID(String sourceID) {
		this.sourceID = sourceID;
	}

	public String getTargetID() {
		return targetID;
	}

	@ModuleOption("Name of the discriminator field on the target (e.g., field name of downstream JSON message).")
	public void setTargetID(String targetID) {
		this.targetID = targetID;
	}

	public String getMappings() {
		return mappings;
	}

	@ModuleOption("Comma-separated list of explicit ID mappings/alias in the form '<string>:<string>'. E.g., 'id1:ID1,id2:ID2'")
	public void setMappings(String mappings) {
		this.mappings = mappings;
	}

	public String getPreMap() {
		return preMap;
	}
	
	@ModuleOption("Apply a map step before enriching. E.g., 'id.*:id:value' turns {id1:v2,id2:v2} into [{id:id1,value:v1},{id:id2,value:v2}]")
	public void setPreMap(String preMap) {
		this.preMap = preMap;
	}
}
