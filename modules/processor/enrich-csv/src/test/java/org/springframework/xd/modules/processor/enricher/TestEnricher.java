package org.springframework.xd.modules.processor.enricher;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;
import io.riox.xd.modules.processor.enricher.EnricherMessageHandler;

import java.util.Map;

import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author: Waldemar Hummer
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations={"classpath:config/enricher.xml","classpath:processor/enricher/test-client.xml"})
@ActiveProfiles("node")
public class TestEnricher {

	JSONParser parser = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);

	private static final String JSON_FILE_1 = "http://samplecsvs.s3.amazonaws.com/Sacramentorealestatetransactions.csv";

    @Test
    public void testEnrich() throws Exception {
    	int timeoutSecs = 3;
    	EnricherMessageHandler h = new EnricherMessageHandler();
    	h.setCache(-1);
    	h.setUrl(JSON_FILE_1);
    	h.setSourceID("longitude");
    	h.setTargetID("lng");
    	h.setColumns("");
    	h.setCache(timeoutSecs);

    	Map<String,Object> result = json((String)h.transform("{\"foo\":\"bar\",\"lng\":\"-121.434879\"}"));
    	assertTrue(result.containsKey("zip"));
    	assertTrue(result.containsKey("latitude"));
    	assertTrue(result.containsKey("city"));
    	long cacheTime1 = h.getLastCacheTime();

    	result = json((String)h.transform("{\"foo\":\"bar\",\"lng\":\"0\"}"));
    	assertFalse(result.containsKey("zip"));
    	assertFalse(result.containsKey("latitude"));

    	result = json((String)h.transform("{\"foo\":\"bar\",\"lng\":\"-121.431028\"}"));
    	assertTrue(result.containsKey("zip"));
    	assertTrue(result.containsKey("latitude"));
    	long cacheTime2 = h.getLastCacheTime();

    	assertEquals(cacheTime1, cacheTime2);

    	Thread.sleep((timeoutSecs + 1) * 1000);

    	result = json((String)h.transform("{\"foo\":\"bar\",\"lng\":\"-121.431028\"}"));
    	assertTrue(result.containsKey("zip"));
    	assertTrue(result.containsKey("latitude"));
    	long cacheTime3 = h.getLastCacheTime();

    	assertNotEquals(cacheTime2, cacheTime3);

    }

    @Test
    public void testAlias() throws Exception {
    	int timeoutSecs = 3;
    	EnricherMessageHandler h = new EnricherMessageHandler();
    	h.setCache(-1);
    	h.setUrl(JSON_FILE_1);
    	h.setSourceID("longitude");
    	h.setTargetID("lng");
    	h.setColumns("");
    	h.setCache(timeoutSecs);
    	h.setMappings("_placeholder_:-121.434879");

    	Map<String,Object> result = json((String)h.transform("{\"foo\":\"bar\",\"lng\":\"_placeholder_\"}"));
    	assertTrue(result.containsKey("zip"));
    	assertTrue(result.containsKey("latitude"));
    	assertTrue(result.containsKey("city"));
    }

    @SuppressWarnings("unchecked")
	private <T> T json(String json) {
    	try {
			return (T) parser.parse(json);
		} catch (ParseException e) {
			throw new RuntimeException(e);
		}
    }
}
