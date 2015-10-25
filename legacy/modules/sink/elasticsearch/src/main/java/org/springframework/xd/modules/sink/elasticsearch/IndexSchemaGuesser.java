package org.springframework.xd.modules.sink.elasticsearch;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.elasticsearch.action.admin.indices.mapping.get.GetMappingsResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.client.Client;
import org.elasticsearch.cluster.metadata.MappingMetaData;
import org.elasticsearch.common.collect.ImmutableOpenMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author whummer
 */
public class IndexSchemaGuesser {

	private static class SchemaAttribute {
		/**
		 * Name of the index, e.g., "gpsTracker"
		 */
		String index;
		/**
		 * Name of the index, e.g., "locations"
		 */
		String type;
		/**
		 * JSON Path of the attribute, e.g., "details.location"
		 */
		String attribute;

		public SchemaAttribute(String index, String type, String attribute) {
			this.index = index;
			this.type = type;
			this.attribute = attribute;
		}
		@Override
		public int hashCode() {
			final int prime = 31;
			int result = 1;
			result = prime * result
					+ ((attribute == null) ? 0 : attribute.hashCode());
			result = prime * result + ((index == null) ? 0 : index.hashCode());
			result = prime * result + ((type == null) ? 0 : type.hashCode());
			return result;
		}
		@Override
		public boolean equals(Object obj) {
			if (this == obj)
				return true;
			if (obj == null)
				return false;
			if (getClass() != obj.getClass())
				return false;
			SchemaAttribute other = (SchemaAttribute) obj;
			if (attribute == null) {
				if (other.attribute != null)
					return false;
			} else if (!attribute.equals(other.attribute))
				return false;
			if (index == null) {
				if (other.index != null)
					return false;
			} else if (!index.equals(other.index))
				return false;
			if (type == null) {
				if (other.type != null)
					return false;
			} else if (!type.equals(other.type))
				return false;
			return true;
		}
	}

	static class SchemaMapping {
		String schemaType;
		long lastCheckTime;

		public SchemaMapping(String schemaType) {
			this.schemaType = schemaType;
		}
	}

	private static final Logger LOG = LoggerFactory.getLogger(ElasticSearchSinkMessageHandler.class);
	private Map<SchemaAttribute,SchemaMapping> mappings = new HashMap<SchemaAttribute,SchemaMapping>();
	private String index;
	private String type;
	/* re-check every 3 minutes. TODO: Probably make configurable via sink options */
	private long checkTimeoutMS = 1000*60*3;
	private ElasticSearchUtil esUtil;


	public IndexSchemaGuesser(Client client, String index, String type) {
		this.esUtil = new ElasticSearchUtil(client);
		this.index = index;
		this.type = type;
	}

	public void checkIndexSchema(IndexRequest request) {
		checkIndexSchema(request.sourceAsMap());
	}

	public void checkIndexSchema(Map<String,Object> source) {
		checkIndexSchema("", source);
	}

	@SuppressWarnings("unchecked")
	private void checkIndexSchema(String prefix, Map<String,Object> source) {
		for(String key : source.keySet()) {
			Object obj = source.get(key);
			String theKey = prefix + key;
			processSchemaEntry(theKey, obj);
			if(obj instanceof Map<?,?>) {
				/* recurse */
				String prefixNew = theKey + ".";
				checkIndexSchema(prefixNew, (Map<String,Object>)obj);
			}
		}
	}

	private void processSchemaEntry(String attributePath, Object value) {
		SchemaAttribute a = new SchemaAttribute(index, type, attributePath);

		SchemaMapping existing = mappings.get(a);
		if(existing != null) {
			/* custom mapping already present! -> check in regular intervals */
			long diff = System.currentTimeMillis() - existing.lastCheckTime;
			if(diff < checkTimeoutMS)
				return;
		}

		try {
			if(guessAsGeoPoint(attributePath, value)) {
				/* update schema! */
				GetMappingsResponse m = esUtil.getMappings(index, type);

				synchronized (this.getClass()) { /* TODO: think about better approach to make this transactional */

					ImmutableOpenMap<String, ImmutableOpenMap<String, MappingMetaData>> mMap = m.getMappings();

					if(mMap.containsKey(index)) {
						ImmutableOpenMap<String, MappingMetaData> map1 = mMap.get(index);
						if(map1.get(type) != null) {
							Map<String,Object> map = map1.get(type).getSourceAsMap();
							Object schemaType = selectJsonPath(map, attributePath + ".type");
							if(!"geo_point".equals(schemaType)) {
								LOG.info("Updating schema of elasticsearch index/type '" + index + 
										"/" + type +  "' attribute " + attributePath + 
										" from type '" + schemaType + "' to 'geo_point'");

								String tmpID = UUID.randomUUID().toString();
								/* create temp index */
								esUtil.createIndex(tmpID);
								/* copy to temp index */
								esUtil.copyIndex(index, tmpID);
								/* get old mapping */
								GetMappingsResponse maps = esUtil.getMappings(index, type);
								/* delete index */
								esUtil.deleteIndex(index);
								/* re-create index and copy/update schema */
								esUtil.copyIndexSchema(maps.getMappings().get(index), index, type, attributePath, "geo_point");
								/* copy back index data */
								esUtil.copyIndex(tmpID, index);
								/* delete temp index */
								esUtil.deleteIndex(tmpID);
							} else {
								/* record this mapping */
								SchemaMapping mapping = new SchemaMapping((String)schemaType);
								mapping.lastCheckTime = System.currentTimeMillis();
								mappings.put(a, mapping);
							}

						} else {
							System.err.println("Empty list of mappings result received: " + map1); // TODO logger
						}
					} else {
						System.err.println("Invalid mappings result received: " + mMap); // TODO logger
					}

				}
				return;
			}
			/* TODO: add additional checks here */
		} catch (Exception e) {
			//throw new RuntimeException(e);
			e.printStackTrace(); // TODO logger
		}
	}


	private boolean guessAsGeoPoint(String entry, Object value) {
		if(value instanceof String) {
			/* could be geopoint encoded as "16.34,41.12" */
			String v = (String)value;
			if(v.matches("\\s*(-?[0-9]+\\.[0-9]+)\\s*,\\s*(-?[0-9]+\\.[0-9]+)")) {
				return true;
			}
		} else if(value instanceof Map<?,?>) {
			@SuppressWarnings("unchecked")
			Map<String,Object> m = (Map<String, Object>) value;
			Object lat = m.get("lat");
			Object lon = m.get("lon");
			if(m.keySet().size() == 2 && lat instanceof Double && lon instanceof Double) {
				return true;
			}
		}
		return false;
	}

	private Object selectJsonPath(Map<String,Object> map, String path) {
		return selectJsonPath(map, path.split("\\s*\\.\\s*"));
	}
	@SuppressWarnings("all")
	private Object selectJsonPath(Map<String,Object> map, String[] path) {
		if(path.length <= 0)
			return map;
		String part = path[0];
		Object entry = map.get(part);
		String[] pathNew = Arrays.copyOfRange(path, 1, path.length);
		if(entry instanceof Map<?,?>) {
			Map<String,Object> mapNew = (Map<String, Object>) entry;
			return selectJsonPath(mapNew, pathNew);
		}
		if(entry == null) {
			/* could look like this: {properties={myAttribute=...}} instead of {myAttribute=...} */
			entry = map.get("properties");
			if(entry instanceof Map<?,?>) {
				Map<String,Object> mapNew = (Map<String, Object>) entry;
				if(mapNew.containsKey(part))
					return selectJsonPath(mapNew, path);
			}
		}
		return entry;
	}

}
