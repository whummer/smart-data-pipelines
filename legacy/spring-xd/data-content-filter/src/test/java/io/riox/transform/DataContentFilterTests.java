package io.riox.transform;

import static org.junit.Assert.*;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Test;
import org.springframework.xd.tuple.TupleBuilder;

/**
 * Implements unit test for the {@link DataContentFilter} transformer.
 * 
 * @author riox
 */
public class DataContentFilterTests {
	
	@Test()
	public void nonexistingKey() throws JSONException {
		DataContentFilter processor = new DataContentFilter("doesnotexist");
		String result = processor.transform(
				TupleBuilder.tuple().of("id", 1, "measurement", 5.123D).toString());
		
		JSONObject json = new JSONObject(result);

		System.out.println("result: " + result.toString());
		assertNotNull(json.getDouble("measurement")); 
		assertNotNull(json.get("id")); 
	}
	
	@Test()
	public void testMalformedJson() throws JSONException {
		DataContentFilter processor = new DataContentFilter("measurement");
		String result = processor.transform(
				"{\"id\":\"5\" , \"measurement\" : \"xxxxxx }");
		
		JSONObject json = new JSONObject(result);

		System.out.println("result: " + result.toString());
		assertNotNull(json.get("error")); 
	}

	@Test(expected=JSONException.class)
	public void singleFlat() throws JSONException {
		DataContentFilter processor = new DataContentFilter("measurement");
		String result = processor.transform(
				TupleBuilder.tuple().of("id", 1, "measurement", 5.123D).toString());
		
		
		JSONObject json = new JSONObject(result);

		System.out.println("result: " + result.toString());
		json.getDouble("measurement"); // yields exception as per signature b/c value does not exist as expected
	}
	
	
	@Test
	public void multipleFlat() throws InterruptedException, JSONException {
		DataContentFilter processor = new DataContentFilter("key1,key3,key4");
		String result = processor.transform(
				TupleBuilder.tuple()
					.put("id", 1)
					.put("key1", 5.123D)
					.put("key2", "yeah")
					.put("key3", 5.123D)
					.put("key4", TupleBuilder.tuple().of("subkey1", "subval1"))
					.build().toString()			
				);
		
		System.out.println("result: " + result.toString());	
		
		JSONObject json = new JSONObject(result);

		assertEquals("yeah", json.getString("key2"));
		
		// ensure we check each value that should be absent and catch the exception.
		try {
			json.get("key1");
			fail();
		} catch (JSONException e1) { }
		
		try {
			json.get("key3");
			fail();
		} catch (JSONException e1) { }
		try {
			json.get("key4");
			fail();
		} catch (JSONException e1) { }
	
	}
	

	@Test
	public void multipleFlatWithWhitespace() throws InterruptedException, JSONException {
		DataContentFilter processor = new DataContentFilter("key1, key3,   key4");
		String result = processor.transform(
				TupleBuilder.tuple()
					.put("key1", 5.123D)
					.put("key2", "yeah")
					.put("key3", 5.123D)
					.put("key4", TupleBuilder.tuple().of("subkey1", "subval1"))
					.build().toString()				
				);
		
		System.out.println("result: " + result.toString());	
		
		JSONObject json = new JSONObject(result);
		assertEquals("yeah", json.get("key2"));
		
		// ensure we check each value that should be absent and catch the exception.
		try {
			json.get("key1");
			fail();
		} catch (JSONException e1) { }
		
		try {
			json.get("key3");
			fail();
		} catch (JSONException e1) { }
		try {
			json.get("key4");
			fail();
		} catch (JSONException e1) { }
	
	}
	
	@Test
	public void multipleCompound() throws InterruptedException, JSONException {
		DataContentFilter processor = new DataContentFilter("key1,key3.subkey31,key4.subkey42,key5.subkey51.subsubkey511");
		String result = processor.transform(
				TupleBuilder.tuple()
					.put("key1", "yeah")
					.put("key2", "bim")
					.put("key3", TupleBuilder.tuple().of("subkey31", "subval31", "subkey32", "subval32"))
					.put("key4", TupleBuilder.tuple().of("subkey41", "subval41", "subkey42", "subval42"))					
					.put("key5", TupleBuilder.tuple().of("subkey51", TupleBuilder.tuple().of("subsubkey511", "subsubval511", "subsubkey512", "subsubval512")))
					.build().toString()			
				);
		
		JSONObject json = new JSONObject(result);
		
		System.out.println("result: " + result.toString());	
		assertEquals("bim", json.get("key2"));
		assertEquals("subval32", ((JSONObject)json.get("key3")).get("subkey32"));
		assertEquals("subval41", ((JSONObject)json.get("key4")).get("subkey41"));
		
		// ensure we check each value that should be absent and catch the exception.
		try {
			json.get("key1");
			fail();
		} catch (JSONException e1) { }
		
		try {
			json.getJSONObject("key3").get("subkey31");
			fail();
		} catch (JSONException e1) { }
		
		try {
			json.getJSONObject("key4").get("subkey42");
			fail();
		} catch (JSONException e1) { }		
	}
	
	
	@Test
	public void multipleCompound2() throws InterruptedException, JSONException {
		DataContentFilter processor = new DataContentFilter("key1.id,key1.timestamp,key1.subkey11,key1.subkey12");
		String result = processor.transform(
				TupleBuilder.tuple()					
					.put("key1", TupleBuilder.tuple().of("subkey11", "subval11", "subkey12", "subval12"))
					.put("key2", TupleBuilder.tuple().of("subkey21", "subval21", "subkey22", "subval22"))
					.build().toString()			
				);
		
		System.out.println("result: " + result.toString());	
		
		JSONObject json = new JSONObject(result);

		assertEquals("subval21", json.getJSONObject("key2").get("subkey21"));
		assertEquals("subval22", json.getJSONObject("key2").get("subkey22"));
		
		// ensure we check each value that should be absent and catch the exception.
		try {
			json.get("key1");
			fail();
		} catch (JSONException e1) { }
				
	}
	
}
