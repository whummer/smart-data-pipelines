/*
 * Copyright 2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.riox.cloud.stream.module.splitter;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import io.riox.cloud.stream.module.splitter.SplitterProcessor;
import io.riox.cloud.stream.module.splitter.SplitterProcessorApplication;

import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.boot.test.WebIntegrationTest;
import org.springframework.cloud.stream.annotation.Bindings;
import org.springframework.cloud.stream.messaging.Processor;
import org.springframework.cloud.stream.test.binder.MessageCollector;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * Integration Tests for the Script Processor.
 *
 * @author Waldemar Hummer
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = SplitterProcessorApplication.class)
@WebIntegrationTest(randomPort = true)
@DirtiesContext
public abstract class SplitterProcessorTests {

	@Autowired
	@Bindings(SplitterProcessor.class)
	protected Processor channels;

	@Autowired
	protected MessageCollector collector;

	private static final String DOC_FILE_1 = "https://www.wien.gv.at/wartezeiten/meldeservice/wartezeiten.svc/GetWartezeiten";

	static String readStream(InputStream is) {
		Scanner s = new java.util.Scanner(is);
		s.useDelimiter("\\A");
		String str = s.hasNext() ? s.next() : "";
	    s.close();
	    return str;
	}

	@WebIntegrationTest(randomPort = true, 
			value = "mapping=MBA.*:shortName:waitingTime")
	@SuppressWarnings("unchecked")
	public static class UsingRemoteFileIntegrationTests extends SplitterProcessorTests {

	    @Test
	    public void testPreMap() throws Exception {
	    	String doc = readStream(new URL(DOC_FILE_1).openStream());
			channels.input().send(new GenericMessage<Object>(doc));

	    	Message<?> response = collector.forChannel(channels.output()).take();

			List<Map<String,Object>> result = (List<Map<String, Object>>) response.getPayload();
	    	int num = doc.split("MBA[^\"]+").length - 1;
	    	assertEquals(num, result.size());
	    	assertTrue(result.get(1).containsKey("shortName"));
	    	assertTrue(result.get(1).containsKey("waitingTime"));
	    }

	}

}
