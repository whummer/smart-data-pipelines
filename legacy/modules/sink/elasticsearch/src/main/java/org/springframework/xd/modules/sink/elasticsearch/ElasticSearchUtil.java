package org.springframework.xd.modules.sink.elasticsearch;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.elasticsearch.action.admin.indices.cache.clear.ClearIndicesCacheRequest;
import org.elasticsearch.action.admin.indices.create.CreateIndexRequest;
import org.elasticsearch.action.admin.indices.create.CreateIndexResponse;
import org.elasticsearch.action.admin.indices.delete.DeleteIndexRequest;
import org.elasticsearch.action.admin.indices.delete.DeleteIndexResponse;
import org.elasticsearch.action.admin.indices.mapping.get.GetMappingsRequest;
import org.elasticsearch.action.admin.indices.mapping.get.GetMappingsResponse;
import org.elasticsearch.action.admin.indices.mapping.put.PutMappingRequest;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.IndicesAdminClient;
import org.elasticsearch.client.transport.TransportClientNodesService;
import org.elasticsearch.client.transport.support.InternalTransportClient;
import org.elasticsearch.cluster.metadata.MappingMetaData;
import org.elasticsearch.cluster.node.DiscoveryNode;
import org.elasticsearch.common.collect.ImmutableList;
import org.elasticsearch.common.collect.ImmutableOpenMap;
import org.elasticsearch.common.hppc.cursors.ObjectCursor;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.search.Scroll;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;
import org.springframework.data.elasticsearch.client.TransportClientFactoryBean;

public class ElasticSearchUtil {

	private Client client;
	private IndicesAdminClient indicesClient;

	public ElasticSearchUtil(Client client) {
		this.client = client;
		this.indicesClient = client.admin().indices();
	}

	public void copyIndex(String fromIndex, String toIndex) {
		try {
			SearchRequest searchReq = new SearchRequest(fromIndex);
			searchReq.scroll(new Scroll(TimeValue.timeValueMinutes(1)));
			SearchResponse searchResponse = client.search(searchReq).get();

			SearchHits hits = searchResponse.getHits();
			if(hits.getTotalHits() > 0) {
				BulkRequest bulkReq = new BulkRequest();
				for (SearchHit hit : hits) {
		            IndexRequest request = new IndexRequest(toIndex, hit.type(), hit.id());
		            request.source(hit.sourceAsString(), true);
		            bulkReq.add(request);
		        }
				client.bulk(bulkReq).get();
			}
		} catch (Exception e) {
			Thread.dumpStack();
			throw new RuntimeException(e);
		}
	}

	public GetMappingsResponse getMappings(String index, String type) {
		GetMappingsRequest getMap = new GetMappingsRequest();
		getMap.indices(index);
		getMap.types(type);
		GetMappingsResponse m = indicesClient.getMappings(getMap).actionGet();
		return m;
	}

	public List<String> listIndices() {
		List<String> result = new LinkedList<String>();
		for(ObjectCursor<String> key : client.admin().cluster()
		    .prepareState().execute()
		    .actionGet().getState()
		    .getMetaData().indices().keys()) {
			result.add(key.value);
		}
		return result;
	}

	public void copyIndexSchema(ImmutableOpenMap<String, MappingMetaData> mappings, String toIndex, String typeName,
			String attributePath, String attributeType) {
		try {
			createIndex(toIndex);
			/* copy mappings */
			for(ObjectCursor<String> type : mappings.keys()) {
				Map<String,Object> mappingMap = mappings.get(type.value).getSourceAsMap();
				if(typeName.equals(type.value)) {
					String keyPath = attributePath.replaceAll("\\.", ".properties.");
					String keyPathWithProps = "properties." + keyPath + ".type";
					setJsonPath(mappingMap, keyPathWithProps, attributeType);
				}
				PutMappingRequest putMap = new PutMappingRequest(toIndex);
				putMap.type(type.value);
				putMap.source(mappingMap);
				indicesClient.putMapping(putMap).get();
			}
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public CreateIndexResponse createIndex(String index) {
		CreateIndexRequest createReq = new CreateIndexRequest(index);
		return indicesClient.create(createReq).actionGet();
	}

	public DeleteIndexResponse deleteIndex(String index) {
		DeleteIndexRequest delReq = new DeleteIndexRequest(index);
		return indicesClient.delete(delReq).actionGet();
	}

	public void clearCache(String index) {
		ClearIndicesCacheRequest clearReq = new ClearIndicesCacheRequest(index);
		client.admin().indices().clearCache(clearReq).actionGet();
	}

	public static Client cloneClient(Client client) {
		/* TODO */
		try {
			Field f = client.getClass().getDeclaredField("internalClient");
			f.setAccessible(true);
			InternalTransportClient internal = (InternalTransportClient)f.get(client);
			f = client.getClass().getDeclaredField("nodesService");
			f.setAccessible(true);
			TransportClientNodesService nodesService = (TransportClientNodesService)f.get(client);
			f = nodesService.getClass().getDeclaredField("listedNodes");
			f.setAccessible(true);
			@SuppressWarnings("unchecked")
			ImmutableList<DiscoveryNode> nodes = (ImmutableList<DiscoveryNode>) f.get(nodesService);
			String nodesString = "";
			for(DiscoveryNode n : nodes) {
				InetSocketTransportAddress address = (InetSocketTransportAddress)n.getAddress();
				nodesString += address.address().getHostName() + ":" + address.address().getPort() + ",";
			}
			if(nodesString.endsWith(",")) {
				nodesString = nodesString.substring(0, nodesString.length() - 1);
			}

			f = internal.getClass().getDeclaredField("settings");
			f.setAccessible(true);
			Settings settings = (Settings) f.get(internal);

			/* create factory */
			TransportClientFactoryBean fact = new TransportClientFactoryBean();
			/* default values */
			fact.setClientIgnoreClusterName(false);
			fact.setClientPingTimeout("5s");
			fact.setClientNodesSamplerInterval("5s");
			fact.setClientTransportSniff(true);
			/* copy existing config values */
			fact.setClusterName(settings.get("cluster.name"));
			fact.setClusterNodes(nodesString);
			fact.afterPropertiesSet();
			Client cloned = fact.getObject();
			return cloned;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	public Object setJsonPath(Map<String,Object> map, String path, Object value) {
		return setJsonPath(map, path.split("\\s*\\.\\s*"), value);
	}
	@SuppressWarnings("all")
	public Object setJsonPath(Map<String,Object> map, String[] path, Object value) {
		if(path.length == 1) {
			return map.put(path[0], value);
		}
		if(!map.containsKey(path[0])) {
			map.put(path[0], new HashMap<String,Object>());
		}
		Map<String,Object> mapNew = (Map<String, Object>) map.get(path[0]);
		String[] pathNew = Arrays.copyOfRange(path, 1, path.length);
		return setJsonPath(mapNew, pathNew, value);
	}

}
