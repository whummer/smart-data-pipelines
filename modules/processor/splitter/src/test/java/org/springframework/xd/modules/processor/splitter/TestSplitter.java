package org.springframework.xd.modules.processor.splitter;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import io.riox.xd.modules.processor.splitter.SplitterMessageHandler;

import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

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
@ContextConfiguration(locations={"classpath:config/splitter.xml","classpath:processor/splitter/test-client.xml"})
@ActiveProfiles("node")
public class TestSplitter {

	JSONParser parser = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);

	private static final String DOC_FILE_1 = "http://www.wien.gv.at/wartezeiten/meldeservice/wartezeiten.svc/GetWartezeiten";

	static String readStream(InputStream is) {
		Scanner s = new java.util.Scanner(is);
		s.useDelimiter("\\A");
		String str = s.hasNext() ? s.next() : "";
	    s.close();
	    return str;
	}

    @Test
    public void testPreMap() throws Exception {
    	SplitterMessageHandler h = new SplitterMessageHandler();
    	h.setMapping("MBA.*:shortName:waitingTime");

    	String doc = readStream(new URL(DOC_FILE_1).openStream());

    	List<Map<String,Object>> result = h.transform(doc);
    	int num = doc.split("MBA[^\"]+").length - 1;
    	assertEquals(num, result.size());
    	assertTrue(result.get(1).containsKey("shortName"));
    	assertTrue(result.get(1).containsKey("waitingTime"));
    }

}
