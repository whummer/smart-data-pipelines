package io.riox.cloud.stream.module.csvenricher;

import groovy.json.JsonBuilder;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import lombok.extern.slf4j.Slf4j;
import net.minidev.json.parser.JSONParser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.messaging.Processor;
import org.springframework.integration.annotation.Transformer;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHandlingException;

/**
 * MessageHandler implementation for message enricher (e.g., load static data from CSV).
 *
 * @author Waldemar Hummer (whummer)
 * @author Oliver Moser
 */

@EnableBinding(Processor.class)
@Slf4j
public class CsvEnricher {

	@Autowired
	private CsvEnricherProperties properties;

	private static final String FIELD_TABLE = "_table";

	private static final String FIELD_ENTRY = "_entry";

	private final JSONParser json = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);

	final AtomicReference<Object> cachedObject = new AtomicReference<>();

	final AtomicReference<Long> lastCacheTime = new AtomicReference<>(0L);

	private Mappings mappingsObj;

	private static class Mapping {

		String v1;

		String v2;

		public Mapping(String v1, String v2) {
			this.v1 = v1;
			this.v2 = v2;
		}
	}

	private static class Mappings {
		List<Mapping> mappings = new LinkedList<Mapping>();
	}

	@Transformer(inputChannel = Processor.INPUT, outputChannel = Processor.OUTPUT)
	public Object transform(Message<?> message) {
		log.info("Accepted message: {}", message);
		try {
			if (message.getPayload() instanceof List<?>) {
				return processMessage((List<?>) message.getPayload());
			} else {
				return processMessage(Arrays.asList(message.getPayload()));
			}
		} catch (Exception e) {
			throw new MessageHandlingException(message, e);
		}
	}

	@SuppressWarnings("unchecked")
	private Object processMessage(String payload) {
		try {
			Map<String, Object> obj = (Map<String, Object>) json.parse(payload);
			Map<String, Object> result = processMessage(obj);
			JsonBuilder builder = new JsonBuilder(result);
			return builder.toString();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	private Object processMessage(List<?> messages) throws Exception {
		for (Object o : messages) {
			if (o instanceof String) {
				return processMessage((String) o);
			} else if (o instanceof List<?>) {
				processMessage((List<?>) o);
			} else if (o instanceof Map<?, ?>) {
				Map<?, ?> map = (Map<?, ?>) o;
				JsonBuilder builder = new JsonBuilder(map);
				return processMessage(builder.toString());
			} else {
				throw new RuntimeException("Cannot extract payload from message: " + o + (o == null ? "" : (" - " + o.getClass())));
			}
		}

		return null;
	}


	private String getAlias(String id) {
		if (mappingsObj == null) {
			mappingsObj = new Mappings();
			if (properties.getMappings() != null) {
				for (String mapping : properties.getMappings().split("\\s*,\\s*")) {
					String v1 = mapping.split("\\s*:\\s*")[0];
					String v2 = mapping.split("\\s*:\\s*")[1];
					mappingsObj.mappings.add(new Mapping(v1, v2));
				}
			}
		}

		for (Mapping m : mappingsObj.mappings) {
			if (m.v1.equals(id))
				return m.v2;
			if (m.v2.equals(id))
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
		if (properties.getCache() > 0) {
			long diff = (System.currentTimeMillis() - lastCacheTime.get()) / 1000L; /* difference in seconds */
			if (diff > properties.getCache()) {
				doFetch = true;
			}
		}

		if (doFetch) {
			T item = fetchTableData();
			setCached(item);
		}
		return (T) cachedObject.get();
	}

	@SuppressWarnings("unchecked")
	private <T> T fetchTableData() {
		String[] cols = properties.getColumns() == null ? new String[0] : properties.getColumns().split("\\s*,\\s*");
		if (cols.length == 1 && cols[0].trim().equals("")) {
			cols = new String[0];
		}

		TableData table = TableData.readCSV(properties.getLocation(), properties.getColumns() != null, cols);
		return (T) table;
	}

	@SuppressWarnings("unchecked")
	private <T> T getTableData() {
		T cached = getCached();
		if (cached != null)
			return cached;
		return (T) cachedObject.get();
	}

	private void setPayload(Map<String, Object> payload, String key, TableData value) {
		setPayload(payload, key, value.asObjectList());
	}

	private void setPayload(Map<String, Object> payload, String key, TableData.Record value) {
		setPayload(payload, key, value.asMap());
	}

	private void setPayload(Map<String, Object> payload, String key, Object value) {
		while (!properties.isOverwrite() && payload.containsKey(key)) {
			key = "_" + key;
		}
		payload.put(key, value);
	}

	private Map<String, Object> processMessage(Map<String, Object> payload) {
		TableData table = getTableData();
		String tgtIDValue = properties.getSourceID() == null ? null : (String) payload.get(properties.getTargetID());
		if (tgtIDValue == null) {
			log.warn("Unable to find '" + properties.getTargetID() + "' in message: " + payload);
		}

		/* find record for ID */
		TableData.Record rec = properties.getSourceID() == null ? null : table.find(properties.getSourceID(), tgtIDValue);

		/* find record for ID alias, if present */
		if (rec == null && tgtIDValue != null && properties.getSourceID() != null) {
			String alias = getAlias(tgtIDValue);
			if (alias != null) {
				rec = table.find(properties.getSourceID(), alias);
			}
			if (rec == null) {
				log.warn("Cannot find '" + properties.getSourceID() + "'='" + tgtIDValue + "' (alias '" + alias + "')" +
					" in table records.");
			}
		}

		if (rec != null) {
			if (properties.isFlat()) {
				Map<String,Object> recAsMap = rec.asMap();
				for (String key : table.getHeaderMap().keySet()) {
					setPayload(payload, key, recAsMap.get(key));
				}
			} else {
				setPayload(payload, FIELD_ENTRY, rec);
			}
		} else {
			/* unable to find matching item -> add entire table result,
			 * only if properties.getSourceID() and targetID are null */
			if (properties.getSourceID() == null && properties.getTargetID() == null) {
				setPayload(payload, FIELD_TABLE, table);
			}
		}

		return payload;
	}
}
