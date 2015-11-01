package io.riox.cloud.stream.module.csvenricher;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;

import java.util.Map;
import java.util.concurrent.TimeUnit;

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
import org.springframework.messaging.Message;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author Waldemar Hummer
 * @author Oliver Moser
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = CsvEnricherApplication.class)
@WebIntegrationTest(randomPort=true)
public abstract class CsvEnricherTests {

	@Autowired
	CsvEnricherProperties properties;

	@Autowired
	@Bindings(CsvEnricher.class)
	Processor channels;

	@Autowired
	MessageCollector collector;

	@Autowired
	CsvEnricher enricher;

	JsonParser parser = new JacksonJsonParser();

	public void prepareTestEnrich() throws Exception {

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

	public Map<String, Object> prepareTestAlias() throws Exception {
		Map<String, Object> enrichedMap = pushAndPoll("{\"foo\":\"bar\",\"lng\":\"_placeholder_\"}");
		return enrichedMap;
	}

	@SuppressWarnings("unchecked")
	<T> T pushAndPoll(String payload) throws InterruptedException {
		channels.input().send(new GenericMessage<>(payload));
		Message<?> enrichedMessage = collector.forChannel(channels.output()).poll(5, TimeUnit.SECONDS);
		Object result = enrichedMessage.getPayload();
		return (T)result;
	}

	@WebIntegrationTest(value={
		"server.port:0",
		"csv.cache=3",
		"csv.location=http://samplecsvs.s3.amazonaws.com/Sacramentorealestatetransactions.csv",
		"csv.sourceID=longitude",
		"csv.targetID=lng",
		"csv.columns=",
		"csv.mappings=_placeholder_:-121.434879"
	}, randomPort=true)
	public static class TestsWithColumns extends CsvEnricherTests {
		@Test
		public void testEnrich() throws Exception {
			prepareTestEnrich();
		}
		@Test
		public void testAlias() throws Exception {
			Map<String, Object> enrichedMap = prepareTestAlias();
			assertTrue(enrichedMap.containsKey("zip"));
			assertTrue(enrichedMap.containsKey("latitude"));
			assertTrue(enrichedMap.containsKey("city"));
		}
	}

	@WebIntegrationTest(value={
		"server.port:0",
		"csv.cache=3",
		"csv.location=http://samplecsvs.s3.amazonaws.com/Sacramentorealestatetransactions.csv",
		"csv.sourceID=longitude",
		"csv.targetID=lng",
		"csv.mappings=_placeholder_:-121.434879"
	}, randomPort=true)
	public static class TestsWithoutColumns extends CsvEnricherTests {
		@Test
		public void testAlias() throws Exception {
			Map<String, Object> enrichedMap = prepareTestAlias();
			assertTrue(enrichedMap.containsKey("foo"));
			assertTrue(enrichedMap.containsKey("lng"));
		}
	}

	@WebIntegrationTest(value={
		"server.port:0",
//		"csv.location=http://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:AMTOGD&srsName=EPSG:4326&outputFormat=csv",
		"csv.location=http://pastebin.com/raw.php?i=6wKuCFNr",
		"csv.sourceID=OBJECTID",
		"csv.targetID=shortName",
		"csv.columns=",
		"csv.mappings=860435:MBA1_8,859029:MBA2,859030:MBA3,859057:MBA4_5,859050:MBA6_7,859042:MBA9,859032:MBA10,860422:MBA11,859051:MBA12,859058:MBA13_14,859037:MBA15,859060:MBA16,860503:MBA17,860425:MBA18,859028:MBA19,859026:MBA20,859065:MBA21,859040:MBA22,859076:MBA23"
	}, randomPort=true)
	public static class TestOpenDataVienna extends CsvEnricherTests {
		@Test
		public void testAlias() throws Exception {
			Map<String, Object> enrichedMap = pushAndPoll("{\"IsOpen\":false, \"Timestamp\":\"14:43\", \"Wartekreis\":0, \"origin\":\"passservice\", \"shortName\":\"MBA2\", \"waitingTime\":0}");
			assertTrue(enrichedMap.containsKey("SHAPE"));
			assertTrue(enrichedMap.containsKey("NAME"));
			assertTrue(enrichedMap.containsKey("Wartekreis"));
			assertEquals(enrichedMap.get("OBJECTID"), "859029");

			enrichedMap = pushAndPoll("{\"IsOpen\":false, \"Timestamp\":\"14:43\", \"Wartekreis\":0, \"origin\":\"passservice\", \"shortName\":\"MBA3\", \"waitingTime\":0}");
			assertTrue(enrichedMap.containsKey("SHAPE"));
			assertTrue(enrichedMap.containsKey("NAME"));
			assertTrue(enrichedMap.containsKey("Wartekreis"));
			assertEquals(enrichedMap.get("OBJECTID"), "859030");
			
			assertTrue(enrichedMap.getClass().getName().startsWith("java.util."));
		}
	}
}
