package io.riox.transform;

import static org.junit.Assert.*;
import static org.springframework.xd.dirt.test.process.SingleNodeProcessingChainSupport.chain;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.springframework.xd.dirt.server.SingleNodeApplication;
import org.springframework.xd.dirt.test.SingleNodeIntegrationTestSupport;
import org.springframework.xd.dirt.test.SingletonModuleRegistry;
import org.springframework.xd.dirt.test.process.SingleNodeProcessingChain;
import org.springframework.xd.module.ModuleType;
import org.springframework.xd.test.RandomConfigurationSupport;

/**
 * @author riox
 */
public class DataContentFilterIntegrationTests {

    private static SingleNodeApplication application;

    private static int RECEIVE_TIMEOUT = 5000;

    private static String moduleName = "data-content-filter";

    private SingleNodeProcessingChain chain;

    /**
     * Start the single node container, binding random unused ports, etc. to not conflict with any other instances
     * running on this host. Configure the ModuleRegistry to include the project module.
     */
    @SuppressWarnings("unused")
	@BeforeClass
    public static void setUp() {

        RandomConfigurationSupport randomConfigSupport = new RandomConfigurationSupport();
        application = new SingleNodeApplication().run();
        SingleNodeIntegrationTestSupport singleNodeIntegrationTestSupport = new SingleNodeIntegrationTestSupport
                (application);
        singleNodeIntegrationTestSupport.addModuleRegistry(new SingletonModuleRegistry(ModuleType.processor,
                moduleName));

    }

    @After
    public void tearDown() {
        chain.destroy();
    }

    @AfterClass
    public static void after() {
        application.close();
    }

    @Test
    public void testRemoveSingleKeyWithJson() throws IOException, JSONException {
    	String streamName = "content-filter-test";
        chain = chain(application, streamName, moduleName + " --excludes=measurement");
        List<String> jsonData = createJsonData(1);
        for (String json : jsonData) {
            chain.sendPayload(json);
        }
        List<JSONObject> results = retrieveResults(chain, 1);
        assertEquals(1, results.size());
        assertEquals("0", results.get(0).get("id"));
        assertNotNull(results.get(0).get("compound"));
        try {
        	results.get(0).get("measurement");
        	fail();
        } catch (JSONException je) {}
    }
    
    @Test
    public void testComplexKeyWithJson() throws IOException, JSONException {
    	String streamName = "content-filter-test";
        chain = chain(application, streamName, moduleName + " --excludes=measurement,compound");
        List<String> jsonData = createJsonData(1);
        for (String json : jsonData) {
            chain.sendPayload(json);
        }
        List<JSONObject> results = retrieveResults(chain, 1);
        assertEquals(1, results.size());
        assertEquals("0", results.get(0).get("id"));
        try {
        	results.get(0).get("measurement");
        	fail();
        } catch (JSONException je) {}
        
        try {
        	results.get(0).get("compound");
        	fail();
        } catch (JSONException je) {}
    }
    
    
    
	private List<String> createJsonData(int items) {
		List<String> jsonData = new ArrayList<String>();
        for (int i = 0; i < items; i++) {
            String measurement = Integer.toString(i+10);
            jsonData.add("{\"id\":\"" + i + "\" , \"measurement\" : \"" + measurement + "\", \"compound\" : { \"foo\" : \"bar\", \"muh\" : \"mee\" } }");
        }
		return jsonData;
	}
    
    private List<JSONObject> retrieveResults(SingleNodeProcessingChain chain, int items) throws JSONException {
        List<JSONObject> outputData = new ArrayList<JSONObject>();
        for (int i = 0; i < items; i++) {
            String payload = (String)chain.receivePayload(RECEIVE_TIMEOUT);
            outputData.add(new JSONObject(payload));
            System.out.println("assertResults: output payload: " + payload);
        }
       return outputData;        
    }

    
}
