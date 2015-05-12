package io.riox.analytics;

import org.json.simple.JSONObject;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.junit.Assert.*;
import static org.springframework.xd.dirt.test.process.SingleNodeProcessingChainSupport.*;

import org.springframework.xd.dirt.server.SingleNodeApplication;
import org.springframework.xd.dirt.test.SingleNodeIntegrationTestSupport;
import org.springframework.xd.dirt.test.SingletonModuleRegistry;
import org.springframework.xd.dirt.test.process.SingleNodeProcessingChain;
import org.springframework.xd.module.ModuleType;
import org.springframework.xd.test.RandomConfigurationSupport;
import org.springframework.xd.tuple.Tuple;
import org.springframework.xd.tuple.TupleBuilder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * @author riox
 */
public class MovingFunctionIntegrationTests {

    private static SingleNodeApplication application;

    private static int RECEIVE_TIMEOUT = 5000;

    private static String moduleName = "analytics-moving-functions";

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
    public void testSimpleWithTupleType() {

        String streamName = "testMovingAverage";

        chain = chain(application, streamName, moduleName + " --itemPath=measurement --function=AVG");

        List<Tuple> inputData = new ArrayList<Tuple>();
        for (int i = 0; i < 10; i++) {
            inputData.add(TupleBuilder.tuple().of("id", i, "measurement", new Double(i+10)));
        }

        for (Tuple tuple: inputData) {
            chain.sendPayload(tuple);
        }
        assertResults(chain, 1, new Double[]{14.5D});
    }

    @Test
    public void testAverageWithJson() throws IOException {

        String streamName = "testMovingAverageJson";

        chain = chain(application, streamName, moduleName + " --inputType=application/x-xd-tuple --itemPath=measurement --function=AVG");
        List<String> jsonData = createJsonData(10);
        for (String json : jsonData) {
            chain.sendPayload(json);
        }
        assertResults(chain, 1, new Double[] { 14.5D });
    }


    @Test
    public void testMinWithJson() throws IOException {

        String streamName = "testMovingMinJson";

        chain = chain(application, streamName, moduleName + " --inputType=application/x-xd-tuple --itemPath=measurement --function=MIN");
        List<String> jsonData = createJsonData(10);
        for (String json : jsonData) {
            chain.sendPayload(json);
        }
        assertResults(chain, 1, new Double[] { 10.0 });
    }

    @Test
    public void testMaxWithJson() throws IOException {

        String streamName = "testMovingMAXJson";

        chain = chain(application, streamName, moduleName + " --inputType=application/x-xd-tuple --itemPath=measurement --function=MAX");
        List<String> jsonData = createJsonData(10);
        for (String json : jsonData) {
            chain.sendPayload(json);
        }
        assertResults(chain, 1, new Double[] { 19.0 });
    }

		@Test
		public void testSumWithJson() throws IOException {

			String streamName = "testMovingSumJson";

			chain = chain(application, streamName, moduleName + " --inputType=application/x-xd-tuple --itemPath=measurement --function=SUM");
			List<String> jsonData = createJsonData(10);
			for (String json : jsonData) {
				chain.sendPayload(json);
			}
			assertResults(chain, 1, new Double[] { 145.0 });
		}


	@Test
    public void testItemsWithFlatJson() throws IOException {

        String streamName = "testMovingAverageJson";

        chain = chain(application, streamName, moduleName + " --inputType=application/x-xd-tuple --items=5 --itemPath=measurement --function=AVG");
        List<String> jsonData = createJsonData(10);
        for (String json : jsonData) {
            chain.sendPayload(json);
        }
        assertResults(chain, 2, new Double[] { 12.0D, 17.0D });
    }
    
    
    @Test
    public void testItemsWithComplexJson() throws IOException {

        String streamName = "testMovingAverageJson";

        chain = chain(application, streamName, moduleName + " --inputType=application/x-xd-tuple --function=AVG --items=5 --itemPath=car-data.speed");
        List<String> jsonData = createComplexJsonData(10);
        for (String json : jsonData) {
            chain.sendPayload(json);
        }
        assertResults(chain, 2, new Double[] { 12.0D, 17.0D });
    }
    
    @Test
    public void testItemsWithComplexJson2() throws IOException {

        String streamName = "testMovingAverageJson";

        chain = chain(application, streamName, moduleName + " --inputType=application/x-xd-tuple --function=AVG --items=5 --itemPath=car-data.fluid-levels.brake");
        List<String> jsonData = createComplexJsonData(10);
        for (String json : jsonData) {
            chain.sendPayload(json);
        }
        assertResults(chain, 2, new Double[] { 0.9D, 0.9D });
    }
    

    /**
     * Tests a more complex path where the final element does not exist.
     */
    @Test
    public void testItemsWithNonExistingPath() throws IOException {

        String streamName = "testMovingAverageJson";

        chain = chain(application, streamName, moduleName + " --inputType=application/x-xd-tuple --function=AVG --items=5 --itemPath=car-data.fluid-levels.doesnotexist");
        List<String> jsonData = createComplexJsonData(10);
        for (String json : jsonData) {
            chain.sendPayload(json);
        }
        assertResults(chain, 2, new Double[] { Double.NaN, Double.NaN });
    }
    
    /**
     * Tests a more complex path where the some path element in the middle does not exist.
     */
    @Test
    public void testItemsWithNonExistingPath2() throws IOException {

        String streamName = "testMovingAverageJson";

        chain = chain(application, streamName, moduleName + " --inputType=application/x-xd-tuple --function=AVG --items=5 --itemPath=car-data.doesnotexist.brake");
        List<String> jsonData = createComplexJsonData(10);
        for (String json : jsonData) {
            chain.sendPayload(json);
        }
        assertResults(chain, 2, new Double[] { Double.NaN, Double.NaN });
    }

	private List<String> createJsonData(int items) {
		List<String> jsonData = new ArrayList<String>();
        for (int i = 0; i < items; i++) {
            String measurement = Integer.toString(i+10);
            jsonData.add("{\"id\":\"" + i + "\" , \"measurement\" : \"" + measurement + "\"}");
        }
		return jsonData;
	}
	
	@SuppressWarnings("unchecked")
	private List<String> createComplexJsonData(int items) {
		List<String> jsonData = new ArrayList<String>();
        for (int i = 0; i < items; i++) {
            String measurement = Integer.toString(i+10);
            
            JSONObject json = new JSONObject();
            JSONObject carData = new JSONObject();
            JSONObject fluidLevels = new JSONObject();
            
            json.put("id", i);
            json.put("car-data", carData);
            carData.put("speed", measurement);                       
            carData.put("fluid-levels", fluidLevels);
            fluidLevels.put("brake", "0.9");
            fluidLevels.put("windscreen", 0.4);           
            jsonData.add(json.toJSONString());
        }
		return jsonData;
	}
    
    private void assertResults(SingleNodeProcessingChain chain, int items, Double[] expected) {
        List<Tuple> outputData = new ArrayList<Tuple>();
        for (int i = 0; i < items; i++) {
            Tuple tuple = (Tuple)chain.receivePayload(RECEIVE_TIMEOUT);
            outputData.add(tuple);
            System.out.println("assertResults: output Tuple = [ + " + tuple + "]");
        }
        
        for (int i = 0; i < expected.length; i++) {
        	Tuple tuple = outputData.get(i);
            assertEquals(expected[i], tuple.getDouble(MovingFunction.KEY), 0);
        }       
        
    }
    
    
}
