/*
 * Copyright 2014 the original author or authors.
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

package org.springframework.xd.modules.sink.elasticsearch;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import net.minidev.json.parser.JSONParser;

import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.client.AdminClient;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.IndicesAdminClient;
import org.elasticsearch.client.transport.NoNodeAvailableException;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.MessageChannel;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.web.client.RestTemplate;

/**
 * @author: Waldemar Hummer
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations={"classpath:config/elasticsearch.xml","classpath:elasticsearch/sink/test-guesser.xml"})
@ActiveProfiles("http")
@Ignore
public class TestSchemaGuesser {

    @Autowired @Qualifier("input")
    MessageChannel outputChannel;

    @Autowired
    RestTemplate restTemplate;

    List<String> positiveExamples = Arrays.asList(
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"1\",\"details\":{\"location\":\"14.12,-40.1\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"2\",\"details\":{\"location\":\"14.12,-40.2\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"3\",\"details\":{\"location\":\"14.12,-40.3\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"4\",\"details\":{\"location\":\"14.12,-40.4\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"5\",\"details\":{\"location\":\"14.12,-40.5\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"6\",\"details\":{\"location\":\"14.12,-40.6\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"7\",\"details\":{\"location\":\"14.12,-40.7\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"8\",\"details\":{\"location\":\"14.12,-40.8\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"9\",\"details\":{\"location\":\"14.12,-40.9\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"10\",\"details\":{\"location\":\"14.12,-40.10\"}}",

    		"{\"text\":\"#WorldCup is cool\",\"id\":\"1\",\"details\":{\"location\":\"14.13,-40.1\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"2\",\"details\":{\"location\":\"14.13,-40.2\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"3\",\"details\":{\"location\":\"14.13,-40.3\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"4\",\"details\":{\"location\":\"14.13,-40.4\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"5\",\"details\":{\"location\":\"14.13,-40.5\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"6\",\"details\":{\"location\":\"14.13,-40.6\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"7\",\"details\":{\"location\":\"14.13,-40.7\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"8\",\"details\":{\"location\":\"14.13,-40.8\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"9\",\"details\":{\"location\":\"14.13,-40.9\"}}",
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"10\",\"details\":{\"location\":\"14.13,-40.10\"}}"
    );
    List<String> negativeExamples = Arrays.asList(
    		"{\"text\":\"#WorldCup is cool\",\"id\":\"1\"}"
    );

    static String ELASTICSEARCH_TEST_ENDPOINT = "elasticsearch.development.svc.cluster.local";
    static String index = "testindex";
    static String type = "testtype";
    static Client client;
    static boolean localMode = ELASTICSEARCH_TEST_ENDPOINT == null;
    static IndexSchemaGuesser guesser;
    static List<Invocation> invocations = new LinkedList<Invocation>();

    static class Invocation {
    	Object proxy;
    	Method method;
    	Object[] args;
    	public Invocation(Object proxy, Method method, Object[] args) {
			this.proxy = proxy;
			this.method = method;
			this.args = args;
		}
    }

    @BeforeClass
    public static void setup() {
    	if(ELASTICSEARCH_TEST_ENDPOINT != null) {
    		client = new TransportClient().
    				addTransportAddress(new InetSocketTransportAddress(ELASTICSEARCH_TEST_ENDPOINT, 9300));
    		guesser = new IndexSchemaGuesser(client, index, type);
    	} else {
    		guesser = new IndexSchemaGuesser(mockClient(getHandler()), index, type);
    	}
    }

    @SuppressWarnings("all")
	@Test
	public void testGuesser() throws Exception {
    	try {
    		JSONParser parser = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);
    		for(String in : positiveExamples) {
    			Object obj = parser.parse(in);
    	    	int invsBefore = invocations.size();
    	    	if(!localMode)
    	    		insertIntoES(in);
    	    	guesser.checkIndexSchema((Map<String,Object>)obj);
    			if(localMode)
    				assertSchemaChange(obj, invsBefore, 1);
    		}
    		for(String in : negativeExamples) {
    			Object obj = parser.parse(in);
    	    	int invsBefore = invocations.size();
    	    	if(!localMode)
    	    		insertIntoES(in);
    	    	guesser.checkIndexSchema((Map<String,Object>)obj);
    			if(localMode)
    				assertSchemaChange(obj, invsBefore, 0);
    		}
		} catch (NoNodeAvailableException e) {
			// currently we can only integration-test this, 
			// hence skip this test if no ES available
		}
    }

    private void insertIntoES(String message) throws Exception {
    	IndexRequest request =  new IndexRequest(index, type);
        request.source((message).getBytes());
        getClient().index(request).get();
    }

    private Client getClient() {
    	return client;
    }

    @SuppressWarnings("all")
    private void assertSchemaChange(Object obj, int invsBefore, int expected) {
		int invsAfter = invocations.size();
		int diff = invsAfter - invsBefore;
		Assert.assertEquals(expected, diff);
    }

    static Client mockClient(InvocationHandler h) {
    	return (Client)Proxy.newProxyInstance(TestSchemaGuesser.class.getClassLoader(), new Class[]{Client.class}, h);
    }
    static AdminClient mockAdminClient(InvocationHandler h) {
    	return (AdminClient)Proxy.newProxyInstance(TestSchemaGuesser.class.getClassLoader(), new Class[]{AdminClient.class}, h);
    }
    static IndicesAdminClient mockIndicesClient(InvocationHandler h) {
    	return (IndicesAdminClient)Proxy.newProxyInstance(TestSchemaGuesser.class.getClassLoader(), new Class[]{IndicesAdminClient.class}, h);
    }
    static InvocationHandler getHandler() {
    	return new InvocationHandler() {
			public Object invoke(Object proxy, Method method, Object[] args)
					throws Throwable {
				if(method.getName().equals("admin")) {
					return mockAdminClient(this);
				}
				if(method.getName().equals("indices")) {
					return mockIndicesClient(this);
				}
				invocations.add(new Invocation(proxy, method, args));
				return null;
			}
		};
    }
}
