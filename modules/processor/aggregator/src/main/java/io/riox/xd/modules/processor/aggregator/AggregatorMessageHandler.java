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

package io.riox.xd.modules.processor.aggregator;

import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import net.minidev.json.parser.JSONParser;

import org.apache.commons.lang.StringUtils;

/**
 * MessageHandler implementation for message aggregator.
 *
 * @author: Waldemar Hummer (whummer)
 */
public class AggregatorMessageHandler {

	private static final String FIELD_NAME = "_aggregate_<type>";

	/**
	 * Option "mappings" (see {@link AggregatorProcessorOptionMetadata})
	 */
	private volatile AggregationType type = null;
	/**
	 * Option "fields" (see {@link AggregatorProcessorOptionMetadata})
	 */
	private volatile String fields = null;
	/**
	 * Option "groupBy" (see {@link AggregatorProcessorOptionMetadata})
	 */
	private volatile String groupBy = null;
	/**
	 * Option "discriminators" (see {@link AggregatorProcessorOptionMetadata})
	 */
	private volatile String discriminators = null;
	/**
	 * Option "append" (see {@link AggregatorProcessorOptionMetadata})
	 */
	private volatile Boolean append = true;


	public static enum AggregationType {
		SUM, MIN, MAX
	}

	private final JSONParser json = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);
	private final List<String> discriminatorFields = new LinkedList<String>();
	private final List<String> groupByFields = new LinkedList<String>();

	private static final class Group extends HashMap<String,Object> {
		private static final long serialVersionUID = 1L;
		Map<Discriminator,Map<String,Object>> docs = new LinkedHashMap<>();
	}
	private static final class Discriminator extends HashMap<String,Object> {
		private static final long serialVersionUID = 1L;
	}

	private Discriminator getDiscriminator(Map<String,Object> payload) {
		Discriminator d = new Discriminator();
		if(StringUtils.isEmpty(discriminators)) {
			return d;
		}
		for(String field : discriminatorFields) {
			d.put(field, payload.get(field));
		}
		return d;
	}
	private Group getGroup(Map<String,Object> payload) {
		Group g = new Group();
		if(StringUtils.isEmpty(groupBy)) {
			return g;
		}
		for(String field : groupByFields) {
			g.put(field, payload.get(field));
		}
		return g;
	}

	@SuppressWarnings("unchecked")
	public <T> T transform(String payload) {
		try {
			Map<String, Object> obj = (Map<String,Object>)json.parse(payload);
			return (T) processMessage(obj);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@SuppressWarnings("unchecked")
	public <T> T transform(Map<String, Object> payload) {
		return (T) processMessage(payload);
	}

	@SuppressWarnings("unchecked")
	public <T> T transform(List<Map<String, Object>> payload) {
		for(int i = 0; i < payload.size(); i ++) {
			Map<String, Object> result = (Map<String, Object>) processMessage(payload.get(i));
			payload.set(i, result);
		}
		return (T) payload;
	}

	public Map<String, Object> processMessage(Map<String, Object> payload) {
		Group g = getGroup(payload);
		Discriminator d = getDiscriminator(payload);
		g.docs.put(d, payload);
		double aggregated = DocAggregator.aggregate(type, g.docs.values(), fields);
		payload = (append != null && append) ? payload : new HashMap<String,Object>();
		String field = FIELD_NAME.replace("<type>", "" + type);
		payload.put(field, aggregated);
		return payload;
	}

	/* GETTERS / SETTERS */

	public void setDiscriminators(String discriminators) {
		this.discriminators = discriminators;
		if(discriminators != null) {
			this.discriminatorFields.addAll(Arrays.asList(
					discriminators.split("[\\s,]+")));
		}
	}
	public void setGroupBy(String groupBy) {
		this.groupBy = groupBy;
		if(groupBy != null) {
			this.groupByFields.addAll(Arrays.asList(
					groupBy.split("[\\s,]+")));
		}
	}
	public void setFields(String fields) {
		this.fields = fields;
	}
	public void setType(AggregationType type) {
		this.type = type;
	}
}
