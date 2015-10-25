package io.riox.cloud.stream.module.splitter;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.messaging.Processor;
import org.springframework.integration.annotation.Transformer;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHandlingException;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Processor implementation for message splitter.
 *
 * @author: Waldemar Hummer
 */
@EnableBinding(Processor.class)
public class SplitterProcessor {

	@Autowired
	private SplitterProcessorProperties properties;

	ObjectMapper mapper = new ObjectMapper();

	@Transformer(inputChannel = Processor.INPUT, outputChannel = Processor.OUTPUT)
	@SuppressWarnings("unchecked")
	public Object transform(Message<?> message) {
		try {
			if (message.getPayload() instanceof String) {
				return processMessage((String) message.getPayload());
			} else if (message.getPayload() instanceof Map) {
				return processMessage((Map<String,Object>)message.getPayload());
			} else {
				throw new RuntimeException("Unexpected message payload: " + message.getPayload());
			}
		} catch (Exception e) {
			throw new MessageHandlingException(message, e);
		}
	}

	@SuppressWarnings("unchecked")
	private <T> T processMessage(String payload) {
		try {
			Map<String, Object> obj = mapper.readValue(payload, Map.class);
			String mapping = properties.getMapping();
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
	private <T> T processMessage(Map<String, Object> payload) {
		String mapping = properties.getMapping();
		if(mapping != null) {
			List<Map<String,Object>> mapped = DocSplitter.map(payload, mapping);
			return (T) mapped;
		}
		return (T) payload;
	}

}
