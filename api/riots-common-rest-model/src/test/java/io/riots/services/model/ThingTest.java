package io.riots.services.model;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertEqualsNoOrder;
import static org.testng.Assert.assertNotNull;
import io.riots.services.core.ThingType;

import java.io.IOException;
import java.io.StringWriter;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONException;
import org.skyscreamer.jsonassert.JSONAssert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Tests the JSON round-triping of the SmartObjects API. 
 * 
 * @author riox
 */
public class ThingTest  {

	static final Logger log = LoggerFactory.getLogger(ThingTest.class);

	@Test
	public void testThingRoundtrip() throws IOException, URISyntaxException, JSONException {
		log.info("Executing testThingRoundtrip() ...");
		
		ObjectMapper mapper = new ObjectMapper();
		ThingType t = mapper.readValue( getClass().getResource("/device-type-sample.json").openStream(), ThingType.class);
		assertNotNull(t);
		
		// Write ThingType into JSON string in-memory
		StringWriter targetJson = new StringWriter();
		mapper.writeValue(targetJson, t);
		
		JsonNode originalTree = mapper.readTree(getClass().getResource("/device-type-sample.json").openStream());
		log.info(targetJson.toString());
		JSONAssert.assertEquals(targetJson.toString(), originalTree.toString(), false);				
	}
	

}
