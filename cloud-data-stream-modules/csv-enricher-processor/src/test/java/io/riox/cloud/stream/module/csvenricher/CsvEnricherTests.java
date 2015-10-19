package io.riox.cloud.stream.module.csvenricher;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.boot.test.WebIntegrationTest;
import org.springframework.cloud.stream.annotation.Bindings;
import org.springframework.cloud.stream.messaging.Processor;
import org.springframework.cloud.stream.test.binder.MessageCollector;
import org.springframework.context.ApplicationContext;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.Map;
import java.util.concurrent.TimeUnit;

import static org.junit.Assert.*;

/**
 * @author Waldemar Hummer
 * @author Oliver Moser
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = CsvEnricherApplication.class)
@WebIntegrationTest({
	"server.port:0",
	"csv.cache=3",
	"csv.url=http://samplecsvs.s3.amazonaws.com/Sacramentorealestatetransactions.csv",
	"csv.sourceID=longitude",
	"csv.targetID=lng",
	"csv.columns=",
	"csv.mappings=_placeholder_:-121.434879"
})
public class CsvEnricherTests {

	@Autowired
	private ApplicationContext context;

	@Autowired
	private CsvEnricherProperties properties;

	@Autowired
	@Bindings(CsvEnricher.class)
	private Processor channels;

	@Autowired
	private MessageCollector collector;

	@Autowired
	private CsvEnricher enricher;

	JsonParser parser = new JacksonJsonParser();

	@Test
	public void testEnrich() throws Exception {

		// message 1
		Map<String, Object> enrichedMap = pushAndPoll("{\"foo\":\"bar\",\"lng\":\"-121.434879\"}");
		assertTrue(enrichedMap.containsKey("zip"));
		assertTrue(enrichedMap.containsKey("latitude"));
		assertTrue(enrichedMap.containsKey("city"));
		long cacheTime1 = enricher.lastCacheTime.get();

		// message 2
		enrichedMap = pushAndPoll("{\"foo\":\"bar\",\"lng\":\"0\"}");
		assertFalse(enrichedMap.containsKey("zip"));
		assertFalse(enrichedMap.containsKey("latitude"));

		// message 3
		enrichedMap = pushAndPoll("{\"foo\":\"bar\",\"lng\":\"-121.431028\"}");
		assertTrue(enrichedMap.containsKey("zip"));
		assertTrue(enrichedMap.containsKey("latitude"));
		long cacheTime2 = enricher.lastCacheTime.get();
		assertEquals(cacheTime1, cacheTime2);

		Thread.sleep((properties.getCache() + 1) * 1000);

		// message 4
		enrichedMap = pushAndPoll("{\"foo\":\"bar\",\"lng\":\"-121.431028\"}");
		assertTrue(enrichedMap.containsKey("zip"));
		assertTrue(enrichedMap.containsKey("latitude"));
		long cacheTime3 = enricher.lastCacheTime.get();
		assertNotEquals(cacheTime2, cacheTime3);
	}

	@Test
	public void testAlias() throws Exception {
		Map<String, Object> enrichedMap = pushAndPoll("{\"foo\":\"bar\",\"lng\":\"_placeholder_\"}");
		assertTrue(enrichedMap.containsKey("zip"));
		assertTrue(enrichedMap.containsKey("latitude"));
		assertTrue(enrichedMap.containsKey("city"));
	}

	Map<String, Object> pushAndPoll(String payload) throws InterruptedException {
		channels.input().send(new GenericMessage<>(payload));
		Message enrichedMessage = collector.forChannel(channels.output()).poll(5, TimeUnit.SECONDS);
		return parser.parseMap(enrichedMessage.getPayload().toString());
	}

}
