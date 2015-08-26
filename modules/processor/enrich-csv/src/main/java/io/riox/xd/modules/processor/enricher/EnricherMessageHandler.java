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

import groovy.json.JsonBuilder;
import io.riox.xd.modules.processor.enricher.TableData.Record;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import net.minidev.json.parser.JSONParser;

/**
 * MessageHandler implementation for message enricher (e.g., load static data from CSV).
 *
 * @author: Waldemar Hummer (whummer)
 */
public class EnricherMessageHandler {

	private static final String FIELD_TABLE = "_table";
	private static final String FIELD_ENTRY = "_entry";

	private static final Logger LOG = LoggerFactory.getLogger(EnricherMessageHandler.class);

	/**
	 * Option "cache" (see {@link EnricherProcessorOptionMetadata})
	 */
	private volatile Integer cache;
	/**
	 * Option "columns" (see {@link EnricherProcessorOptionMetadata})
	 */
	private volatile String columns;
	/**
	 * Option "url" (see {@link EnricherProcessorOptionMetadata})
	 */
	private volatile String url;
	/**
	 * Option "flat" (see {@link EnricherProcessorOptionMetadata})
	 */
	private volatile Boolean flat = true;
	/**
	 * Option "overwrite" (see {@link EnricherProcessorOptionMetadata})
	 */
	private volatile Boolean overwrite = false;
	/**
	 * Option "sourceID" (see {@link EnricherProcessorOptionMetadata})
	 */
	private volatile String sourceID = null;
	/**
	 * Option "targetID" (see {@link EnricherProcessorOptionMetadata})
	 */
	private volatile String targetID = null;
	/**
	 * Option "mappings" (see {@link EnricherProcessorOptionMetadata})
	 */
	private volatile String mappings = null;
	/**
	 * Option "preMap" (see {@link EnricherProcessorOptionMetadata})
	 */
	private volatile String preMap = null;


	private final JSONParser json = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);
	private final AtomicReference<Object> cachedObject = new AtomicReference<Object>();
	private final AtomicReference<Long> lastCacheTime = new AtomicReference<Long>(0L);
	private Mappings mappingsObj;

	private static class Mapping {
		String v1, v2;

		public Mapping(String v1, String v2) {
			this.v1 = v1;
			this.v2 = v2;
		}
	}
	private static class Mappings {
		List<Mapping> mappings = new LinkedList<Mapping>();
	}

	@SuppressWarnings("unchecked")
	public <T> T transform(String payload) {
		try {
			Map<String, Object> obj = (Map<String,Object>)json.parse(payload);
			if(preMap != null) {
				List<Map<String,Object>> mapped = DocMapper.map(obj, preMap);
				return (T)transform(mapped);
			}
			Map<String, Object> result = processMessage(obj);
			JsonBuilder builder = new JsonBuilder(result);
			return (T)builder.toString();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@SuppressWarnings("unchecked")
	public <T> T transform(Map<String, Object> payload) {
		if(preMap != null) {
			List<Map<String,Object>> mapped = DocMapper.map(payload, preMap);
			return (T) transform(mapped);
		}
		return (T) processMessage(payload);
	}

	public List<Object> transform(List<Map<String,Object>> payload) {
		List<Object> result = new LinkedList<Object>();
		for(Map<String,Object> item : payload) {
			result.add(processMessage(item));
		}
		return result;
	}

	private String getAlias(String id) {
		if(mappingsObj == null) {
			mappingsObj = new Mappings();
			if(mappings != null) {
				for(String mapping : mappings.split("\\s*,\\s*")) {
					String v1 = mapping.split("\\s*:\\s*")[0];
					String v2 = mapping.split("\\s*:\\s*")[1];
					mappingsObj.mappings.add(new Mapping(v1,v2));
				}
			}
		}
		for(Mapping m : mappingsObj.mappings) {
			if(m.v1.equals(id))
				return m.v2;
			if(m.v2.equals(id))
				return m.v1;
		}
		return null;
	}

	private <T> void setCached(T item) {
		cachedObject.set(item);
		lastCacheTime.set(System.currentTimeMillis());
	}

	@SuppressWarnings("unchecked")
	private <T> T getCached() {
		boolean doFetch = cachedObject.get() == null;
		if(cache > 0) {
			long diff = (System.currentTimeMillis() - lastCacheTime.get()) / 1000L; /* difference in seconds */
			if(diff > cache) {
				doFetch = true;
			}
		}
		if(doFetch) {
			T item = fetchItem();
			setCached(item);
		}
		return (T) cachedObject.get();
	}

	@SuppressWarnings("unchecked")
	private <T> T fetchItem() {
		String[] cols = columns == null ? new String[0] : columns.split("\\s*,\\s*");
		if(cols.length == 1 && cols[0].trim().equals("")) {
			cols = new String[0];
		}
		TableData table = TableData.readCSV(url, columns != null, cols);
		return (T)table;
	}

	@SuppressWarnings("unchecked")
	private <T> T getItem() {
		T cached = getCached();
		if(cached != null)
			return cached;
		return (T) cachedObject.get();
	}

	private void setPayload(Map<String, Object> payload, String key, TableData value) {
		setPayload(payload, key, value.asObjectList());
	}

	private void setPayload(Map<String, Object> payload, String key, Record value) {
		setPayload(payload, key, value.asMap());
	}

	private void setPayload(Map<String, Object> payload, String key, Object value) {
		while(!overwrite && payload.containsKey(key)) {
			key = "_" + key;
		}
		payload.put(key, value);
	}

	private Map<String, Object> processMessage(Map<String, Object> payload) {
		TableData table = getItem();
		String tgtIDValue = targetID == null ? null : (String)payload.get(targetID);
		if(tgtIDValue == null) {
			LOG.warn("Unable to find '" + targetID + "' in message: " + payload);
		}
		/* find record for ID */
		Record rec = sourceID == null ? null : table.find(sourceID, tgtIDValue);
		/* find record for ID alias, if present */
		if(rec == null && tgtIDValue != null && sourceID != null) {
			String alias = getAlias(tgtIDValue);
			if(alias != null) {
				rec = table.find(sourceID, alias);
			}
			if(rec == null) {
				LOG.warn("Cannot find '" + sourceID + "'='" + tgtIDValue + "' (alias '" + alias + "') in table records.");
			}
		}
		if(rec != null) {
			if(flat) {
				for(String key: table.getHeaderMap().keySet()) {
					setPayload(payload, key, rec.asMap().get(key));
				}
			} else {
				setPayload(payload, FIELD_ENTRY, rec);
			}
		} else {
			/* unable to find matching item -> add entire table result, 
			 * only if sourceID and targetID are null */
			if(sourceID == null && targetID == null) {
				setPayload(payload, FIELD_TABLE, table);
			}
		}
		return payload;
	}

	/* GETTERS / SETTERS */

	public void setCache(Integer cache) {
		this.cache = cache;
	}

	public void setFlat(Boolean flat) {
		this.flat = flat;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public void setColumns(String columns) {
		this.columns = columns;
	}

	public void setSourceID(String sourceID) {
		this.sourceID = sourceID;
	}

	public void setTargetID(String targetID) {
		this.targetID = targetID;
	}

	public void setOverwrite(Boolean overwrite) {
		this.overwrite = overwrite;
	}

	public void setMappings(String mappings) {
		this.mappings = mappings;
	}

	public void setPreMap(String preMap) {
		this.preMap = preMap;
	}

	public Long getLastCacheTime() {
		return lastCacheTime.get();
	}

}
