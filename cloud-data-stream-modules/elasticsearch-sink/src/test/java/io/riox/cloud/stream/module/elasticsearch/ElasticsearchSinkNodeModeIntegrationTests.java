package io.riox.cloud.stream.module.elasticsearch;

import com.jayway.jsonpath.JsonPath;
import org.apache.commons.io.FileUtils;
import org.elasticsearch.action.ActionFuture;
import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.client.Client;
import org.junit.AfterClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.boot.test.WebIntegrationTest;
import org.springframework.cloud.stream.annotation.Bindings;
import org.springframework.cloud.stream.messaging.Sink;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.util.StringUtils;
import org.springframework.util.SystemPropertyUtils;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import static org.elasticsearch.node.NodeBuilder.nodeBuilder;
import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;

/**
 * @author Oliver Moser
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = {ElasticsearchSinkApplication.class,
		ElasticsearchSinkNodeModeTestConfiguration.class})
@WebIntegrationTest({
	"server.port:0",
	"es.mode:node",
	"es.index:twitter",
	"es.type:tweet",
	"es.idPath=$.id",
	"es.clusterName=riox",
})
public class ElasticsearchSinkNodeModeIntegrationTests {

	public static final int DELAY_BEFORE_GET = 1000;

	public static final int RETRIES = 3;

	@Autowired
	@Bindings(ElasticsearchSink.class)
	private Sink sink;

	@Autowired
	private ElasticsearchSinkProperties properties;

	@Autowired
	private Client client;

	@Test
	public void contextLoads() {
		assertNotNull(properties);
		assertNotNull(sink.input());
		assertNotNull(client);
		System.out.println("Client: " + client);
	}

	@Test(timeout = RETRIES * DELAY_BEFORE_GET)
	public void testNodeModePassthrough() throws Exception {
		String documentId = UUID.randomUUID().toString();
		String payload = StringUtils.replace(MockUtils.SOURCE_INPUT, "%ID%", documentId);
		sink.input().send(MessageBuilder.withPayload(payload).build());

		boolean created = false;
		GetResponse document = null;
		do {
			Thread.sleep(DELAY_BEFORE_GET);
			try {
				document = client.get(new GetRequest(properties.getIndex(), properties.getType(), documentId)).get();
				created = true;
			} catch (Exception e) {
				System.out.println("Document not yet found, retrying");
			}
		} while (!created);

		assertThat("ID does not match: " + documentId, documentId, is(document.getId()));
	}
}
