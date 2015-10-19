package io.riox.cloud.stream.module.elasticsearch;

import groovy.json.JsonBuilder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.elasticsearch.action.ActionListener;
import org.elasticsearch.action.admin.indices.create.CreateIndexRequest;
import org.elasticsearch.action.admin.indices.exists.indices.IndicesExistsRequest;
import org.elasticsearch.action.admin.indices.exists.indices.IndicesExistsResponse;
import org.elasticsearch.action.admin.indices.exists.types.TypesExistsRequest;
import org.elasticsearch.action.admin.indices.exists.types.TypesExistsResponse;
import org.elasticsearch.action.admin.indices.mapping.put.PutMappingRequest;
import org.elasticsearch.action.admin.indices.mapping.put.PutMappingResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.client.Client;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.messaging.Sink;
import org.springframework.context.ApplicationContext;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.json.JsonPathUtils;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHandlingException;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * MessageHandler implementation that sends data to an ElasticSearch index.
 * Creates an index using default_mapping.json
 *
 * @author Marius Bogoevici
 * @author Oliver Moser
 */
@EnableBinding(Sink.class)
@Data
@Slf4j
public class ElasticsearchSink {

	@Autowired
	private Client client;

	@Autowired
	private ElasticsearchSinkProperties properties;

	@Autowired
	private ApplicationContext context;

	@PostConstruct
	public void init() throws ExecutionException, InterruptedException, IOException {
		IndicesExistsResponse indexExistsResponse = client.admin().indices().exists(new IndicesExistsRequest(properties.getIndex())).get();
		File indexMappingFile = context.getResource("classpath:index_mapping.json").getFile();
		String indexMapping = FileUtils.readFileToString(indexMappingFile);

		if (!indexExistsResponse.isExists()) {
			log.info("Index '{}' does not exist, creating it with dynamic mapping: \n{}", properties.getIndex(),
				indexMapping);

			CreateIndexRequest createIndexRequest = new CreateIndexRequest(properties.getIndex());
			createIndexRequest.mapping(properties.getType(), indexMapping);
			client.admin().indices().create(createIndexRequest);
		} else {
			TypesExistsRequest typesExistsRequest
				= new TypesExistsRequest(new String[]{properties.getIndex()}, properties.getType());

			TypesExistsResponse response = client.admin().indices().typesExists(typesExistsRequest).get();
			if (!response.isExists()) {
				File typeMappingFile = context.getResource("classpath:type_mapping.json").getFile();
				String typeMapping = FileUtils.readFileToString(typeMappingFile);
				typeMapping = StringUtils.replace(typeMapping, "%TYPE%", properties.getType());
				log.info("Using the following mapping for type '{}': \n{}", properties.getType(), typeMapping);
				PutMappingRequest putMappingRequest
						= new PutMappingRequest(properties.getIndex()).type(properties.getType()).source(typeMapping);

				PutMappingResponse putMappingResponse = client.admin().indices().putMapping(putMappingRequest).get();
				Assert.isTrue(putMappingResponse.isAcknowledged());// todo this might be too much
				log.info("Successfully created mapping for type '{}'", properties.getType());
			} else {
				log.warn("Mapping for type '{}' already exists", properties.getType());
			}
		}
	}

	@ServiceActivator(inputChannel = Sink.INPUT)
	public void handleMessage(Message<?> message) throws Exception {
		log.info("Accepted message: {}", message);
		try {
			if (message.getPayload() instanceof List<?>) {
				processMessage((List<?>) message.getPayload());
			} else {
				processMessage(Arrays.asList(message.getPayload()));
			}
		} catch (Exception e) {
			throw new MessageHandlingException(message, e);
		}
	}

	private void processMessage(List<?> messages) throws Exception {
		for (Object o : messages) {
			if (o instanceof String) {
				processMessage((String) o);
			} else if (o instanceof List<?>) {
				processMessage((List<?>) o);
			} else if (o instanceof Map<?, ?>) {
				Map<?, ?> map = (Map<?, ?>) o;
				JsonBuilder builder = new JsonBuilder(map);
				processMessage(builder.toString());
			} else {
				throw new RuntimeException("Cannot extract payload from message: " + o + (o == null ? "" : (" - " + o.getClass())));
			}
		}
	}

	private void processMessage(String payload) throws Exception {
		IndexRequest request;
		if (properties.getIdPath() == null) {
			request = new IndexRequest(properties.getIndex(), properties.getType());
		} else {
			Object extractedId = JsonPathUtils.evaluate(payload, properties.getIdPath());
			if (!(extractedId instanceof Collection)) {
				request = new IndexRequest(properties.getIndex(), properties.getType(), extractedId.toString());
			} else {
				throw new RuntimeException("The id must be a single value");
			}
		}

		// source the payload
		request.source(payload);

		// index the document
		client.index(request, new SchemaCheckingIndexActionListener(request));
	}

	/**
	 * this ActionListener logs index responses at trace level
	 */
	private class SchemaCheckingIndexActionListener implements ActionListener<IndexResponse> {

		IndexRequest request;

		public SchemaCheckingIndexActionListener(IndexRequest request) {
			this.request = request;
		}

		@Override
		public void onResponse(IndexResponse response) {
			if (log.isTraceEnabled()) {
				log.trace("Successfully indexed: /{}/{}/{}", response.getIndex(), response.getType(), response.getId());
			}
		}

		@Override
		public void onFailure(Throwable throwable) {
			log.error("Index request failed: {}", throwable);
		}
	}
}
