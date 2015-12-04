package io.riox.cloud.stream.module.elasticsearch;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;

import java.io.File;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

import org.elasticsearch.action.admin.indices.exists.indices.IndicesExistsRequest;
import org.elasticsearch.action.deletebyquery.DeleteByQueryResponse;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.io.FileSystemUtils;
import org.elasticsearch.common.settings.ImmutableSettings;
import org.elasticsearch.node.Node;
import org.elasticsearch.node.NodeBuilder;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.boot.test.TestRestTemplate;
import org.springframework.boot.test.WebIntegrationTest;
import org.springframework.cloud.stream.annotation.Bindings;
import org.springframework.cloud.stream.messaging.Sink;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.web.client.RestTemplate;

import com.jayway.jsonpath.JsonPath;

/**
 * @author Marius Bogoevici
 * @author Oliver Moser
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = ElasticsearchSinkApplication.class)
@WebIntegrationTest({
	"server.port:0",
	"es.mode:transport",
	"es.index:twitter",
	"es.type:tweet",
	"es.hosts=localhost:9300",
	"es.idPath=$.id",
	"logging.level.=WARN"
})
public class ElasticsearchSinkTransportModeIntegrationTests {

	public static final int DELAY_BEFORE_RETRY = 1000;

	private static final int RETRIES = 3;

	@Autowired
	@Bindings(ElasticsearchSink.class)
	private Sink sink;

	@Autowired
	private Client client;

	@Autowired
	private ElasticsearchSinkProperties properties;

	@Autowired
	private ElasticsearchSinkTestUtil testUtil;

	private static Node node;

	@BeforeClass
	public static void setUpBeforeClass() throws Exception {
		if (node == null) {
			/* First we delete old data */
			File dataDir = new File("./target/es/data");
			if(dataDir.exists()) {
				FileSystemUtils.deleteRecursively(dataDir, true);
			}
			
			/* Then we start our node for tests */
			node = NodeBuilder
				.nodeBuilder()
				.settings(
					ImmutableSettings.settingsBuilder()
					.put("gateway.type", "local")
					.put("path.data", "./target/es/data")		
					.put("path.logs", "./target/es/logs")		
					.put("path.work", "./target/es/work")		
				).node();

			/* Wait for green status */
			node.client().admin().cluster().prepareHealth()
					.setWaitForGreenStatus().execute().actionGet(); 
		}
	}

	@Before
	public void setup() throws ExecutionException, InterruptedException {
		IndicesExistsRequest existsRequest = new IndicesExistsRequest("twitter");
		if (client.admin().indices().exists(existsRequest).get().isExists()) {
			DeleteByQueryResponse response = client.prepareDeleteByQuery("twitter")
				.setSource("{\"query\" : { \"match_all\" : {} }}")
				.get();

			int status = response.status().getStatus();
			Assert.assertThat("Delete by query did not return HTTP 200: " + status, HttpStatus.OK.value(), is(status));
		}
	}

	@Test
	public void contextLoads() {
		assertNotNull(properties);
		assertNotNull(sink.input());
		System.out.println("Mode: " + properties.getMode());
		System.out.println("Client: " + client);
	}

	@Test(timeout = RETRIES * DELAY_BEFORE_RETRY)
	public void testTransportModePassthrough() throws Exception {
		RestTemplate restTemplate = new TestRestTemplate();
		String documentId = UUID.randomUUID().toString();
		String payload = testUtil.getSampleDocumentWithId("tweet.json", documentId);
		sink.input().send(MessageBuilder.withPayload(payload).build());
		ResponseEntity<String> response;
		do {
			Thread.sleep(DELAY_BEFORE_RETRY);
			response = restTemplate.getForEntity("http://localhost:9200/twitter/tweet/" + documentId, String.class);
		} while (response.getStatusCode() != HttpStatus.OK);

		String id = JsonPath.read(response.getBody(), "$._id");
		assertThat("ID does not match: " + documentId, documentId, is(id));
	}

	/* whu: This test case is disabled, because we removed the functionality to
	 * automatically convert all fields named "location" to a geo_point field */
	@Ignore
	//@Test(timeout = RETRIES * DELAY_BEFORE_RETRY)
	public void testTransportModeLocationQuery() throws Exception {
		RestTemplate restTemplate = new TestRestTemplate();
		String id1 = UUID.randomUUID().toString();
		String tweetWithinDistance = testUtil.getSampleDocumentWithId("tweet_with_location_within_distance.json", id1);

		String id2 = UUID.randomUUID().toString();
		String tweetOutsideDistance = testUtil.getSampleDocumentWithId("tweet_with_location_outside_distance.json", id2);

		sink.input().send(MessageBuilder.withPayload(tweetWithinDistance).build());
		sink.input().send(MessageBuilder.withPayload(tweetOutsideDistance).build());

		ResponseEntity<String> response;
		do {
			Thread.sleep(DELAY_BEFORE_RETRY);
			response = restTemplate.getForEntity("http://localhost:9200/twitter/tweet/_search", String.class);
		} while (response.getStatusCode() != HttpStatus.OK);

		int totalHits = JsonPath.read(response.getBody(), "$.hits.total");
		assertThat("Total hits does not equal '2'", totalHits, is(2));

		String queryWithLocation = testUtil.getFileContent("query_with_location.json");
		SearchRequest searchRequest = new SearchRequest(new String[]{"twitter"}, queryWithLocation.getBytes());
		SearchResponse searchResponse = client.search(searchRequest).get();
		long withinDistanceHits = searchResponse.getHits().totalHits();

		// check that we have a single result
		assertThat("There should be exactly one document within distance", withinDistanceHits, is(1L));

		// check that the ID matches the ID from 'tweet_with_location_within_distance.json'
		assertThat(searchResponse.getHits().getAt(0).getId(), is(id1));
	}
}
