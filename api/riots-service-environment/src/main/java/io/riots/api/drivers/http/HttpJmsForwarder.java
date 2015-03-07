package io.riots.api.drivers.http;

import io.riots.api.services.scenarios.PropertyValue;
import io.riots.api.services.streams.StreamOfThingPropValues;
import io.riots.api.services.streams.StreamType;
import io.riots.api.services.streams.StreamsService;
import io.riots.core.jms.EventBroker;
import io.riots.core.repositories.StreamRepository;
import io.riots.core.util.JSONUtil;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PostConstruct;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Created by omoser on 06/03/15.
 *
 * @author omoser
 */
//@Component
public class HttpJmsForwarder {

	private static final Logger log = org.slf4j.LoggerFactory.getLogger(HttpJmsForwarder.class);

	@Autowired
	StreamRepository streamRepo;

	private RestTemplate restTemplate = new RestTemplate();

	private ConcurrentMap<String, String> endpointMap = new ConcurrentHashMap<>(); // todo grrr

	@PostConstruct
	public void init() {
		streamRepo.findAll().forEach(stream -> {
			if (stream.getSinkConfig() != null && StringUtils.isNotBlank(stream.getSinkConfig().getEndpoint())) {
				if (stream.getType() == StreamType.THING_PROPERTY) {
					String propertyNameFromStream =  ((StreamOfThingPropValues) stream).getPropertyName();
					String endpointConfig = stream.getSinkConfig().getEndpoint();
					endpointMap.put(propertyNameFromStream, endpointConfig);
				}
			}
		});
	}

	@JmsListener(containerFactory = EventBroker.CONTAINER_FACTORY_NAME, destination = EventBroker.MQ_OUTBOUND_PROP_CHANGE_NOTIFY)
	public void pushForward(String data) {
		PropertyValue propertyValueFromData = JSONUtil.fromJSON(data, PropertyValue.class);
		String propertyName = propertyValueFromData.getPropertyName();
		if (endpointMap.containsKey(propertyName)) {
			String endpoint = endpointMap.get(propertyName);
			ResponseEntity<String> response = restTemplate.postForEntity(endpoint, data, String.class);
			log.debug("Response from endpoint: {}/{}", response.getStatusCode(), response.getBody());
		} else {
			log.debug("No matching endpoint found for property {}", propertyName);
		}

	}

}
