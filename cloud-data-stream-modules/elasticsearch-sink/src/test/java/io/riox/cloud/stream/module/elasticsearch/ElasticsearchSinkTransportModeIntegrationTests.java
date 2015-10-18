package io.riox.cloud.stream.module.elasticsearch;

import com.jayway.jsonpath.JsonPath;
import org.apache.commons.io.FileUtils;
import org.elasticsearch.client.Client;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.boot.test.TestRestTemplate;
import org.springframework.boot.test.WebIntegrationTest;
import org.springframework.cloud.cloudfoundry.com.fasterxml.jackson.core.json.PackageVersion;
import org.springframework.cloud.stream.annotation.Bindings;
import org.springframework.cloud.stream.messaging.Sink;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.UUID;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.*;
import static org.junit.Assert.assertNotNull;

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
	"es.idPath=$.id"
})
public class ElasticsearchSinkTransportModeIntegrationTests {

	public static final int DELAY_BEFORE_RETRY = 1000;

	private static final int RETRIES = 3;

	@Autowired
	@Bindings(ElasticsearchSink.class)
	private Sink sink;

	@Autowired
	Client client;

	@Autowired
	ApplicationContext context;

	@Autowired
	private ElasticsearchSinkProperties properties;

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
		File tweetFile = context.getResource("classpath:tweet_with_location.json").getFile();
		String tweet = FileUtils.readFileToString(tweetFile);
		String payload = StringUtils.replace(tweet, "%ID%", documentId);
		sink.input().send(MessageBuilder.withPayload(payload).build());

		ResponseEntity<String> response;
		do {
			Thread.sleep(DELAY_BEFORE_RETRY);
			response = restTemplate.getForEntity("http://localhost:9200/twitter/tweet/" + documentId, String.class);
		} while (response.getStatusCode() != HttpStatus.OK);

		String id = JsonPath.read(response.getBody(), "$._id");
		assertThat("ID does not match: " + documentId, documentId, is(id));
	}
}
