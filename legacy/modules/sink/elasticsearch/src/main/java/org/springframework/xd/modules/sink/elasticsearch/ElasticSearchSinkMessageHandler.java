/*
* Copyright 2014 the original author or authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

package org.springframework.xd.modules.sink.elasticsearch;

import groovy.json.JsonBuilder;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.elasticsearch.action.ActionFuture;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.client.Client;
import org.springframework.integration.handler.AbstractMessageHandler;
import org.springframework.integration.json.JsonPathUtils;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHandlingException;

/**
* MessageHandler implementation that sends data to an ElasticSearch index.
*
* @author: Marius Bogoevici
*/
public class ElasticSearchSinkMessageHandler extends AbstractMessageHandler {


	private volatile Client client;

	private volatile String index;

	private volatile String type;

	private volatile String idPath;

	private volatile String guessSchemas;

	private volatile String addTimestamp;

	private static boolean OVERWRITE_TIMESTAMP = true;
	private static final DateFormat DATE_FORMAT = new SimpleDateFormat("yyyyMMdd'T'HHmmssZ");
	private static final String TIMESTAMP_KEY = "timestamp";
	private IndexSchemaGuesser schemaGuesser;

	public void setClient(Client client) {
		this.client = client;
	}

	/**
	* The ElasticSearch index where the data will be stored
	*
	* @param index - the name of the index, e.g. 'twitter'
	*/
	public void setIndex(String index) {
		this.index = index;
	}


	/**
	* The ElasticSearch type of the stored data
	*
	* @param type - the name of the type, e.g. 'tweet'
	*/
	public void setType(String type) {
		this.type = type;
	}

	/**
	* The JSONPath expression that is used to infer the id of the inserted document
	*
	* @param idPath - JSONPath expression, e.g. '$.id'
	*/
	public void setIdPath(String idPath) {
		this.idPath = idPath;
	}

	/**
	* Whether or not to guess schemas (boolean true/false).
	* @param guessSchemas true or false
	*/
	public void setGuessSchemas(String guessSchemas) {
		this.guessSchemas = guessSchemas;
	}

	/**
	* Whether or not to add timestamps (boolean true/false).
	* @param addTimestamp true or false
	*/
	public void setAddTimestamp(String addTimestamp) {
		this.addTimestamp = addTimestamp;
	}

	@Override
	protected void handleMessageInternal(Message<?> message) throws Exception {
		try {
			if (message.getPayload() instanceof List<?>) {
				processMessage((List<?>)message.getPayload());
			} else {
				processMessage(Arrays.asList(message.getPayload()));
			}
		} catch (Exception e) {
			throw new MessageHandlingException(message, e);
		}
	}

	private void processMessage(List<?> messages) throws Exception {
		for(Object o : messages) {
			if (o instanceof String) {
				processMessage((String)o);
			} else if (o instanceof List<?>) {
				processMessage((List<?>)o);
			} else if (o instanceof Map<?,?>) {
				Map<?,?> map = (Map<?,?>) o;
				JsonBuilder builder = new JsonBuilder(map);
				processMessage(builder.toString());
			} else {
				throw new RuntimeException("Cannot extract payload from message: " + o + (o == null ? "" : (" - " + o.getClass())));
			}
		}
	}

	private void processMessage(String payload) throws Exception {

		IndexRequest request;
		if (idPath == null) {
			request = new IndexRequest(index, type);
		}
		else {
			Object extractedId = JsonPathUtils.evaluate(payload, idPath);
			if (!(extractedId instanceof Collection)) {
				request = new IndexRequest(index, type, extractedId.toString());
			} else {
				throw new RuntimeException("The id must be a single value");
			}
		}
		request.source(payload);
		/* add timestamps */
		if(addTimestamp != null && "true".equals(addTimestamp)) {
			request = addTimestamp(request);
		}
		ActionFuture<IndexResponse> future = client.index(request);
		/* wait until indexed, then (possibly) re-calc the index */
		if(guessSchemas != null && "true".equals(guessSchemas)) {
			future.get();
			checkIndexSchema(request);
		}
	}

	/**
	* Add a timestamp to the given document.
	* @return
	*/
	private IndexRequest addTimestamp(IndexRequest req) {
		Map<String,Object> map = req.sourceAsMap();
		if(OVERWRITE_TIMESTAMP || !map.containsKey(TIMESTAMP_KEY)) {
			String time = DATE_FORMAT.format(new Date());
			map.put(TIMESTAMP_KEY, time);
			logger.debug("Adding timestamp to elasticsearch document: " + TIMESTAMP_KEY + "=" + time);
		}
		req.source(map);
		return req;
	}

	/**
	* check index schema and make adjustments to the schema, if necessary.
	* @param request
	*/
	private void checkIndexSchema(IndexRequest request) {
		if(schemaGuesser == null) {
			schemaGuesser = new IndexSchemaGuesser(client, index, type);
		}
		schemaGuesser.checkIndexSchema(request);
	}

}
