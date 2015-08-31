package org.springframework.xd.modules.processor.regex;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.List;
import java.util.Map;

import io.riox.xd.modules.processor.regex.RegexMessageHandler;
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
@ContextConfiguration(locations={"classpath:config/regex.xml","classpath:processor/regex/test-client.xml"})
@ActiveProfiles("node")
public class TestRegex {

	JSONParser parser = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);

    @SuppressWarnings("all")
	@Test
    public void testRegex() throws Exception {
    	RegexMessageHandler h = new RegexMessageHandler();
    	
    	String payload = "{}";

		/* test: basic object */

    	h.setField("foo");
    	h.setRegex("bar");
    	h.setReplace("123");
    	h.setTargetField(null);
    	payload = "{\"foo\":\"bar\",\"foo1\":\"bar1\"}";
		Map<String,Object> obj = h.transform((Map)json(payload));
		assertEquals("123", obj.get("foo"));
		assertEquals("bar1", obj.get("foo1"));

		/* test: list of objects */

    	h.setField("foo");
    	h.setRegex("bar");
    	h.setReplace("123");
    	h.setTargetField(null);
    	payload = "[{\"foo\":\"bar\"},{\"foo1\":\"bar1\"}]";
		List<Map<String,Object>> list = h.transform((List)json(payload));
		assertTrue(list.get(0) != null);
		assertEquals(list.get(0).get("foo"), "123");
		assertEquals(list.get(1).get("foo1"), "bar1");

		/* test: list of objects with different target field */

    	h.setField("foo");
    	h.setRegex("bar");
    	h.setReplace("123");
    	h.setTargetField("foo2");
    	payload = "[{\"foo\":\"bar\"},{\"foo1\":\"bar1\"}]";
		list = h.transform((List)json(payload));
		assertTrue(list.get(0) != null);
		assertEquals("bar", list.get(0).get("foo"));
		assertEquals("123", list.get(0).get("foo2"));
		assertEquals("bar1", list.get(1).get("foo1"));

		/* test: more complex regex */

    	h.setField("foo");
    	h.setRegex("POINT\\s*\\((.*)\\s(.*)\\)");
    	h.setReplace("$2 $1");
    	h.setTargetField(null);
    	payload = "{\"foo\":\"POINT (16.38 48.20)\"}";
		obj = h.transform((Map)json(payload));
		assertEquals(obj.get("foo"), "48.20 16.38");

    }

    @SuppressWarnings("unchecked")
	private <T> T json(String s) {
    	try {
    		return (T) parser.parse(s);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
    }
}
