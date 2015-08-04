package io.riots.api.drivers.forwarders;

import io.riots.api.services.scenarios.PropertyValue;
import io.riots.api.services.streams.*;
import io.riots.core.jms.EventBroker;
import io.riots.core.repositories.StreamRepository;
import io.riots.core.repositories.StreamSinkRepository;
import io.riots.core.util.JSONUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PostConstruct;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Created by omoser on 06/03/15.
 *
 * @author omoser
 */
@Component
public class StreamSinkForwarder {

	private static final Logger log = LoggerFactory.getLogger(StreamSinkForwarder.class);

	@Autowired
	StreamRepository streamRepo;

	@Autowired
	StreamSinkRepository streamSinkRepository;

	private RestTemplate restTemplate = new RestTemplate();

	private ConcurrentMap<String, StreamSinkHttpEndpoint> httpEndpointMap = new ConcurrentHashMap<>(); // todo grrr

	private ConcurrentMap<String, StreamSinkAmqpEndpoint> amqpEndpointMap = new ConcurrentHashMap<>(); // todo grrr

	private ConcurrentMap<String, String> fileEndpointMap = new ConcurrentHashMap<>(); // todo grrr

	@PostConstruct
	public void init() {
		refreshSinkMapping();
	}

	@JmsListener(containerFactory = EventBroker.CONTAINER_FACTORY_NAME, destination = EventBroker.MQ_OUTBOUND_PROP_CHANGE_NOTIFY)
	public void pushForward(String data) {
		PropertyValue propertyValueFromData = JSONUtil.fromJSON(data, PropertyValue.class);
		String propertyName = propertyValueFromData.getPropertyName();
		if (httpEndpointMap.containsKey(propertyName)) {
			StreamSinkHttpEndpoint httpEndpoint = httpEndpointMap.get(propertyName);
			if (httpEndpoint.isActive()) {
				log.debug("Forwarding '{}' to sink {}", data, httpEndpoint.getEndpointUrl());
				ResponseEntity<String> response = restTemplate.postForEntity(httpEndpoint.getEndpointUrl(), data, String.class);
				log.trace("Response from endpoint: {}/{}", response.getStatusCode(), response.getBody());
			} else {
				log.trace("Skipping inactive http endpoint: {}", httpEndpoint);
			}
		} else {
			log.trace("No matching endpoint found for property {}", propertyName);
		}
	}

	public void refreshSinkMapping() {
		log.debug("Refreshing all sinks");
		httpEndpointMap.clear();
		amqpEndpointMap.clear();
		fileEndpointMap.clear();
		streamRepo.findAll().forEach(stream -> {
			if (stream.hasSink()) {
				StreamSink sink = streamSinkRepository.findOne(stream.getSinkId());
				Assert.notNull(sink);
				if (stream.getType() == StreamType.THING_PROPERTY) {
					String propertyName = ((StreamOfThingPropValues) stream).getPropertyName();
					switch(sink.getType()) {
						case HTTP: {
							StreamSinkHttpEndpoint httpSink = ((StreamSinkHttpEndpoint) sink);
							log.debug("Adding http endpoint to endpoint map: ", httpSink);
							httpEndpointMap.put(propertyName, httpSink);
							break;
						}

						case AMQP: {
							StreamSinkAmqpEndpoint amqpSink = ((StreamSinkAmqpEndpoint) sink);
							log.debug("Adding AMQP endpoint to endpoint map: ", amqpSink);
							amqpEndpointMap.put(propertyName, amqpSink);
							break;
						}

						case FILE: {
							log.debug("Adding FILE sink to sink map: {}", sink.getSinkFilename());
							fileEndpointMap.put(propertyName, sink.getSinkFilename());
							break;
						}

						default: throw new IllegalArgumentException("Unsupported sink type: " + sink.getType());
					}
				} else {
					log.warn("Unsupported stream encountered: {}", stream.getType());
				}
			}
		});
	}

}
