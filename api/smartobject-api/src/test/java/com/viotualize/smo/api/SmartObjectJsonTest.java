package com.viotualize.smo.api;

import org.testng.annotations.Test;
import org.testng.annotations.BeforeClass;

import static org.testng.Assert.assertEqualsNoOrder;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNotNull;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONException;
import org.skyscreamer.jsonassert.JSONAssert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.viotualize.smo.rest.domain.RangeValueDomain;
import com.viotualize.smo.rest.domain.SmartObject;
import com.viotualize.smo.rest.domain.ValueDomain;

/**
 * Tests the JSON round-triping of the SmartObjects API. 
 * 
 * @author riox
 */
public class SmartObjectJsonTest  {

	static final Logger log = LoggerFactory.getLogger(SmartObjectJsonTest.class);


	@BeforeClass
	public static void init() {
		
	}

	@Test
	public void testSmartObjectRead1() throws IOException, URISyntaxException {
		log.info("Executing testSmartObjectRead1() ...");
		
		ObjectMapper mapper = new ObjectMapper();
		SmartObject smo = mapper.readValue( getClass().getResource("/smartobject-example1.json").openStream(), SmartObject.class);
		
		assertNotNull(smo);
		assertEquals(smo.getId(), null);
		assertEquals(smo.getName(), "DS18B20");
		assertEquals(smo.getType(), "sensor");
		assertEquals(smo.getManufacturer(), "Maxim");
		assertEquals(smo.getDescription(), "some text");
		assertEqualsNoOrder( smo.getTags().toArray(), new String[] { "temperature", "thermometer" } );
		
		// static properties
		Map<String, Map<String, String> > staticProps = new HashMap<String, Map<String, String> >(1);
		Map<String, String> dim = new HashMap<String, String>(1);
		dim.put("value", "LxBxH: 4cm x 3cm x 3cm");
		staticProps.put("dimensions", dim);
		assertEquals( smo.getStaticProperties(), staticProps );
		
		// dynamic properties
		Map<String, ValueDomain> dynProps = new HashMap<String, ValueDomain>();
		assertEquals(smo.getDynamicProperties().size(), 3);
		
		dynProps.put("input-voltage", new RangeValueDomain(3, 5, "V", 0));
		dynProps.put("resolution", new RangeValueDomain(9, 12, "bit", 0));
		dynProps.put("temperature", new RangeValueDomain(-55, 125, "C", 0));

		assertEquals(smo.getDynamicProperties(), dynProps );			
	}
	
	@Test
	public void testSmartObjectRead2() throws IOException, URISyntaxException {
		log.info("Executing testSmartObjectRead2() ...");
		
		ObjectMapper mapper = new ObjectMapper();
		SmartObject smo = mapper.readValue( getClass().getResource("/smartobject-example2.json").openStream(), SmartObject.class);
		
		
		
		
		assertNotNull(smo);
	}
	
	@Test
	public void testSmartObjectRoundtrip() throws JsonParseException, JsonMappingException, IOException, JSONException {
		log.info("Executing testSmartObjectRoundtrip() ...");
		
		ObjectMapper mapper = new ObjectMapper();
		
		// read JSON into SmartObject
		SmartObject original = mapper.readValue(getClass().getResource("/smartobject-example1.json").openStream(), SmartObject.class);
		
		// Write SmartObject into JSON string in-memory
		StringWriter targetJson = new StringWriter();
		mapper.writeValue(targetJson, original);
		
		JsonNode originalTree = mapper.readTree(getClass().getResource("/smartobject-example1.json").openStream());
		System.out.println(targetJson.toString());
		JSONAssert.assertEquals(targetJson.toString(), originalTree.toString(), false);

	}
}
