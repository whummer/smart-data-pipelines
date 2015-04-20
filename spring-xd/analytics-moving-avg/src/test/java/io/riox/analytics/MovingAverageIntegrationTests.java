package io.riox.analytics;

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
public class MovingAverageIntegrationTests {

    private static SingleNodeApplication application;

    private static int RECEIVE_TIMEOUT = 5000;

    private static String moduleName = "analytics-moving-average";

    private SingleNodeProcessingChain chain;

    /**
     * Start the single node container, binding random unused ports, etc. to not conflict with any other instances
     * running on this host. Configure the ModuleRegistry to include the project module.
     */
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

        chain = chain(application, streamName, moduleName);

        List<Tuple> inputData = new ArrayList<Tuple>();
        for (int i = 0; i < 10; i++) {
            inputData.add(TupleBuilder.tuple().of("id", i, "measurement", new Double(i+10)));
        }

        for (Tuple tuple: inputData) {
            chain.sendPayload(tuple);
        }
        assertResults(chain, 14.5D);
    }

    @Test
    public void testSimpleWithJson() throws IOException {

        String streamName = "testMovingAverageJson";

        chain = chain(application, streamName, moduleName + " --inputType=application/x-xd-tuple");
        List<String> jsonData = createJsonData(10);
        for (String json : jsonData) {
            chain.sendPayload(json);
        }
        assertResults(chain, 14.5D);
    }
    
    @Test
    public void testItemsWithJson() throws IOException {

        String streamName = "testMovingAverageJson";

        chain = chain(application, streamName, moduleName + " --inputType=application/x-xd-tuple --items=5");
        List<String> jsonData = createJsonData(10);
        for (String json : jsonData) {
            chain.sendPayload(json);
        }
        assertResults2(chain, 2, new Double[] { 12.0D, 17.0D });
    }

	private List<String> createJsonData(int items) {
		List<String> jsonData = new ArrayList<String>();
        for (int i = 0; i < items; i++) {
            String measurement = Integer.toString(i+10);
            jsonData.add("{\"id\":\"" + i + "\" , \"measurement\" : \"" + measurement + "\"}");
        }
		return jsonData;
	}

    private void assertResults(SingleNodeProcessingChain chain, double expectedValue) {
        Tuple tuple = (Tuple)chain.receivePayload(RECEIVE_TIMEOUT);
        assertEquals(expectedValue, tuple.getDouble(MovingAverage.KEY), 0);
    }
    
    
    private void assertResults2(SingleNodeProcessingChain chain, int items, Double[] expected) {
        List<Tuple> outputData = new ArrayList<Tuple>();
        for (int i = 0; i < items; i++) {
            Tuple tuple = (Tuple)chain.receivePayload(RECEIVE_TIMEOUT);
            outputData.add(tuple);
            System.out.println("output Tuple = [ + " + tuple + "]");
        }
        
        for (int i = 0; i < expected.length; i++) {
        	Tuple tuple = outputData.get(i);
            assertEquals(expected[i], tuple.getDouble(MovingAverage.KEY), 0);
        }       
        
    }
    
    
}
