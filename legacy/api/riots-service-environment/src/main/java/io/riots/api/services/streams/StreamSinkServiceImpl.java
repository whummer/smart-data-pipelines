package io.riots.api.services.streams;

import io.riots.api.drivers.forwarders.StreamSinkForwarder;
import io.riots.api.services.streams.StreamSink.StreamSinkType;
import io.riots.api.services.users.User;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.repositories.StreamRepository;
import io.riots.core.repositories.StreamSinkRepository;
import io.riots.core.util.ServiceUtil;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.WebApplicationException;
import java.io.IOException;
import java.net.URI;
import java.util.Date;
import java.util.List;

/**
 * Created by omoser on 09/03/15.
 *
 * @author omoser
 */
@Service
public class StreamSinkServiceImpl implements StreamSinkService {

	static final Logger log = LoggerFactory.getLogger(StreamSinkServiceImpl.class);

	static final int SPRING_XD_ADMIN_PORT = 9393; // todo make this configurable or expose via API

	@Autowired
	StreamSinkRepository streamSinkRepository;

	@Autowired
	StreamRepository streamRepository;

	@Autowired
	AuthHeaders authHeaders;

	@Autowired
	HttpServletRequest req;

	@Autowired
	StreamSinkForwarder streamSinkForwarder;

	@Override
	public List<StreamSink> listSinks(String streamSinkType) {
		String creatorId = ServiceUtil.assertValidUser(authHeaders, req).getId();
		if (StringUtils.isNotBlank(streamSinkType)) {
			StreamSinkType enumType = StreamSinkType.valueOf(streamSinkType);
			if (enumType != null) {
				return streamSinkRepository.findByCreatorIdAndType(creatorId, enumType);
			} else {
				throw new WebApplicationException("No such StreamSinkType: " + streamSinkType);
			}
		} else {
			return streamSinkRepository.findByCreatorId(creatorId);
		}
	}

	@Override
	public StreamSink retrieveSink(String sinkId) {
		return streamSinkRepository.findOne(sinkId);
	}

	@Override
	public StreamSink createSink(StreamSink streamSink) {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		streamSink.setCreated(new Date());
		streamSink.setCreatorId(user.getId());

		try {
			return streamSinkRepository.save(streamSink);
		} finally {
			streamSinkForwarder.refreshSinkMapping(); // todo om this should be covered by an "AfterReturning" aspect
		}

	}

	@Override
	public StreamSink updateSink(StreamSink streamSink) {
		try {
			if (streamSink.isCreateXdStream() && !springXdStreamExists(streamSink)) {
				log.info("Creating XD stream for sink: {}", streamSink.toString());
				createSpringXdStream(streamSink);
			}

			return streamSinkRepository.save(streamSink);
		} finally {
			streamSinkForwarder.refreshSinkMapping(); // todo om this should be covered by an "AfterReturning" aspect
		}
	}

	@Override
	public void removeSink(String sinkId) {
		try {
			streamSinkRepository.delete(sinkId);
			List<Stream> streamsToUpdate = streamRepository.findBySinkId(sinkId);
			streamsToUpdate.stream().forEach(stream -> {
				stream.setSinkId(null);
				streamRepository.save(stream);
			});
		} finally {
			streamSinkForwarder.refreshSinkMapping(); // todo om this should be covered by an "AfterReturning" aspect
		}
	}

	private boolean springXdStreamExists(StreamSink streamSink) {
		RestTemplate template = new RestTemplate();
		template.setErrorHandler(new ResponseErrorHandler() {
			@Override
			public boolean hasError(ClientHttpResponse response) throws IOException {
				return false;
			}

			@Override
			public void handleError(ClientHttpResponse response) throws IOException {

			}
		});

		ResponseEntity<String> response = template.getForEntity(createSpringXdLocationFromSink
				(streamSink) +
				"/streams/definitions/" + streamSink.getName(), String.class);

		return response.getStatusCode() != HttpStatus.NOT_FOUND;
	}

	private void createSpringXdStream(StreamSink streamSink) {
		RestTemplate template = new RestTemplate();
		MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
		form.add("name", streamSink.getName());
		form.add("definition", createSpringXdStreamDefinitionFromSink(streamSink));
		String springXdLocation = createSpringXdLocationFromSink(streamSink)  + "/streams/definitions";
		URI uri = template.postForLocation(springXdLocation, form);
		log.info("Created XD stream at {}", uri);
	}

	private String createSpringXdStreamDefinitionFromSink(StreamSink streamSink) {
		if (StringUtils.isNotBlank(streamSink.getXdStreamDefinition())) {
			return streamSink.getXdStreamDefinition();
		}

		switch (streamSink.getType()) {
			case HTTP: {
				String sinkEndpointUrl = ((StreamSinkHttpEndpoint) streamSink).getEndpointUrl();
				UriComponents uriComponents = UriComponentsBuilder.fromHttpUrl(sinkEndpointUrl).build();
				return "http --port=" + uriComponents.getPort() + " | file";
			}

			case AMQP: {
				// todo implement AMQP here
			}

			default:
				throw new IllegalArgumentException("Unsupported sink type: " + streamSink.getType());
		}
	}

	private String createSpringXdLocationFromSink(StreamSink streamSink) {
		return "http://localhost:" + SPRING_XD_ADMIN_PORT; // todo this is too naive
	}
}
