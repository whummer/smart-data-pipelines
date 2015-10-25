package org.springframework.xd.modules.processor.aggregator;

import static org.junit.Assert.assertEquals;
import io.riox.xd.modules.processor.aggregator.AggregatorMessageHandler;
import io.riox.xd.modules.processor.aggregator.AggregatorMessageHandler.AggregationType;

import java.util.Map;

import net.minidev.json.parser.JSONParser;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author: Waldemar Hummer
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations={"classpath:config/aggregator.xml","classpath:processor/aggregator/test-client.xml"})
@ActiveProfiles("node")
public class TestAggregator {

	private static final double PRECISION = 0.0000001;
	JSONParser parser = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);

    @Test
    public void testAggregateMax() throws Exception {
    	AggregatorMessageHandler h = new AggregatorMessageHandler();
    	h.setField("value");
    	h.setGroupBy("group");
    	h.setDiscriminators("id");
    	h.setType(AggregationType.MAX);

    	/* test groups */
    	String doc = "{\"group\":\"g1\",\"id\":1,\"value\":1}";
    	Map<String,Object> result = h.transform(doc);
    	doc = "{\"group\":\"g1\",\"id\":1,\"value\":2}";
    	result = h.transform(doc);
    	assertEquals(2.0, (Double)result.get("_aggregate_MAX"), PRECISION);
    	assertEquals("g1", result.get("group"));
    	assertEquals(1, result.get("id"));

    	/* test discriminators */
    	doc = "{\"group\":\"g2\",\"id\":1,\"value\":1}";
    	result = h.transform(doc);
    	doc = "{\"group\":\"g2\",\"id\":2,\"value\":3}";
    	result = h.transform(doc);
    	assertEquals(3.0, (Double)result.get("_aggregate_MAX"), PRECISION);
    	assertEquals("g2", result.get("group"));
    	doc = "{\"group\":\"g2\",\"id\":3,\"value\":2}";
    	result = h.transform(doc);
    	assertEquals(3.0, (Double)result.get("_aggregate_MAX"), PRECISION);
    	assertEquals("g2", result.get("group"));
    	doc = "{\"group\":\"g1\",\"id\":1,\"value\":5}";
    	result = h.transform(doc);
    	assertEquals(5.0, (Double)result.get("_aggregate_MAX"), PRECISION);
    	assertEquals("g1", result.get("group"));
    	doc = "{\"group\":\"g2\",\"id\":3,\"value\":3}";
    	result = h.transform(doc);
    	assertEquals(3.0, (Double)result.get("_aggregate_MAX"), PRECISION);
    	assertEquals("g2", result.get("group"));
    }

    @Test
    public void testAggregateSum() throws Exception {
    	AggregatorMessageHandler h = new AggregatorMessageHandler();
    	h.setField("value");
    	h.setGroupBy("group");
    	h.setDiscriminators("id");
    	h.setTargetField("sum");
    	h.setType(AggregationType.SUM);

    	/* test groups */
    	String doc = "{\"group\":\"g1\",\"id\":1,\"value\":1}";
    	Map<String,Object> result = h.transform(doc);
    	doc = "{\"group\":\"g1\",\"id\":1,\"value\":2}";
    	result = h.transform(doc);
    	assertEquals(2.0, (Double)result.get("sum"), PRECISION);
    	assertEquals("g1", result.get("group"));
    	assertEquals(1, result.get("id"));

    	/* test discriminators */
    	doc = "{\"group\":\"g2\",\"id\":1,\"value\":1}";
    	result = h.transform(doc);
    	doc = "{\"group\":\"g1\",\"id\":2,\"value\":3}";
    	result = h.transform(doc);
    	assertEquals(5.0, (Double)result.get("sum"), PRECISION);
    	assertEquals("g1", result.get("group"));
    	doc = "{\"group\":\"g2\",\"id\":3,\"value\":2}";
    	result = h.transform(doc);
    	assertEquals(3.0, (Double)result.get("sum"), PRECISION);
    	assertEquals("g2", result.get("group"));
    	doc = "{\"group\":\"g1\",\"id\":1,\"value\":5}";
    	result = h.transform(doc);
    	assertEquals(8.0, (Double)result.get("sum"), PRECISION);
    	assertEquals("g1", result.get("group"));
    	doc = "{\"group\":\"g2\",\"id\":3,\"value\":3}";
    	result = h.transform(doc);
    	assertEquals(4.0, (Double)result.get("sum"), PRECISION);
    	assertEquals("g2", result.get("group"));
    	doc = "{\"group\":\"g2\",\"id\":2,\"value\":3}";
    	result = h.transform(doc);
    	assertEquals(7.0, (Double)result.get("sum"), PRECISION);
    	assertEquals("g2", result.get("group"));
    }

}
