package io.riox.analytics;

import static org.junit.Assert.assertEquals;
import static org.springframework.xd.dirt.test.process.SingleNodeProcessingChainSupport.chain;

import java.util.ArrayList;
import java.util.List;

import org.json.simple.JSONObject;
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
import org.springframework.xd.tuple.Tuple;
import org.springframework.xd.tuple.TupleBuilder;

/**
 * @author riox
 */
public class GeofenceIntegrationTests {

    private static SingleNodeApplication application;

    private static int RECEIVE_TIMEOUT = 5000;

    private static String moduleName = "analytics-geofence";

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
    public void testCircularGeofenceWithTupleType() {

        String streamName = "testGeofence";

        chain = chain(application, streamName, moduleName + " --latitude=48.216449 --longitude=16.336665 --radius=2000 --latPath=geolocation.lat --longPath=geolocation.long");

        List<Tuple> inputData = new ArrayList<Tuple>();
        for (int i = 0; i < 10; i++) {        	
        	Tuple latLong = TupleBuilder.tuple().of("lat", 48.209593, "long", 16.352925);
    		Tuple geolocation = TupleBuilder.tuple().of("geolocation", latLong);     
            inputData.add(geolocation);
        }

        for (Tuple tuple: inputData) {
            chain.sendPayload(tuple);
        }
        assertResults(chain, 1, new Boolean[] { true });
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
    
    private void assertResults(SingleNodeProcessingChain chain, int items, Boolean[] expected) {
        List<Tuple> outputData = new ArrayList<Tuple>();
        for (int i = 0; i < items; i++) {
            Tuple tuple = (Tuple)chain.receivePayload(RECEIVE_TIMEOUT);
            outputData.add(tuple);
            System.out.println("assertResults: output Tuple = [ + " + tuple + "]");
        }
        
        for (int i = 0; i < expected.length; i++) {
        	Tuple tuple = outputData.get(i);
        	System.out.println("DEBUG: " + tuple.getTuple("riox-analytics"));
        	System.out.println("DEBUG: " + expected[i] + " " + i + " " + expected.length );
            assertEquals(expected[i], tuple.getTuple("riox-analytics").getBoolean(GeofenceDetector.KEY));
        }       
        
    }
    
    
}
