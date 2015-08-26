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

package io.riox.xd.modules.processor.splitter;

import java.util.List;
import java.util.Map;

import net.minidev.json.parser.JSONParser;

/**
 * MessageHandler implementation for message splitter.
 *
 * @author: Waldemar Hummer (whummer)
 */
public class SplitterMessageHandler {

	/**
	 * Option "mappings" (see {@link SplitterProcessorOptionMetadata})
	 */
	private volatile String mapping = null;

	private final JSONParser json = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);

	@SuppressWarnings("unchecked")
	public <T> T transform(String payload) {
		try {
			Map<String, Object> obj = (Map<String,Object>)json.parse(payload);
			if(mapping != null) {
				List<Map<String,Object>> mapped = DocSplitter.map(obj, mapping);
				return (T)mapped;
			}
			return (T)payload;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@SuppressWarnings("unchecked")
	public <T> T transform(Map<String, Object> payload) {
		if(mapping != null) {
			List<Map<String,Object>> mapped = DocSplitter.map(payload, mapping);
			return (T) mapped;
		}
		return (T) payload;
	}

	/* GETTERS / SETTERS */

	public void setMapping(String mapping) {
		this.mapping = mapping;
	}
}
