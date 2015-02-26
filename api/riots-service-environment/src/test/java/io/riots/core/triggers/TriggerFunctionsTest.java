package io.riots.core.triggers;

import io.riots.api.services.catalog.Property;
import io.riots.api.services.scenarios.PropertyValue;
import io.riots.core.util.JSONUtil;
import io.riots.core.util.script.ScriptUtil;

import java.io.IOException;
import java.util.LinkedList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.script.Bindings;

import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * @author whummer
 */
@Test
public class TriggerFunctionsTest {

	public void testSpeedCalc() throws IOException {
		String srcUtil = ScriptUtil.getScriptCode("util/geo");
		String src = ScriptUtil.getScriptCode("speed");
		String code = srcUtil + "\n" + src;
		Map<String,Object> values = new ConcurrentHashMap<>();
		LinkedList<PropertyValue> list = new LinkedList<PropertyValue>();
		Property propLat = new Property("location.latitude");
		Property propLng = new Property("location.longitude");
		values.put("VALUES", list);

		list.add(new PropertyValue(propLat, 10, 0));
		list.add(new PropertyValue(propLng, 10, 0));

		list.add(new PropertyValue(propLat, 10.0001, 1000));
		list.add(new PropertyValue(propLng, 10.0001, 1000));

		list.add(new PropertyValue(propLat, 10.0002, 2000));
		list.add(new PropertyValue(propLng, 10.0002, 2000));

		list.add(new PropertyValue(propLat, 10.0003, 3000));
		list.add(new PropertyValue(propLng, 10.0003, 3000));

		double result = (Double)ScriptUtil.getInstance().execJavaScript(code, values);
		Assert.assertEquals(result, 22.0700468, 0.000001);
	}

	public void testGeoFence() throws IOException {
		String srcUtil = ScriptUtil.getScriptCode("util/geo");
		String src = ScriptUtil.getScriptCode("geoFence");
		String code = srcUtil + "\n" + src;
		Map<String,Object> values = new ConcurrentHashMap<>();
		LinkedList<PropertyValue> list = new LinkedList<PropertyValue>();
		Property propLat = new Property("location.latitude");
		Property propLng = new Property("location.longitude");
		values.put("VALUES", list);
		values.put("CONFIG", JSONUtil.fromJSON("{"
				+ "\"center\": {"
				+ "\"latitude\": 10.0001, \"longitude\": 10.0001"
				+ "}, "
				+ "\"diameter\": 10"
				+ "}", Map.class));

		String THING_1 = "thing1";
		String THING_2 = "thing2";

		list.add(new PropertyValue(THING_1, propLat, 10, 0));
		list.add(new PropertyValue(THING_1, propLng, 10, 0));

		Bindings result = (Bindings)ScriptUtil.getInstance().execJavaScript(code, values);
		Assert.assertEquals(result.get(THING_1), false);

		list.add(new PropertyValue(THING_2, propLat, 10.0001, 1000));
		list.add(new PropertyValue(THING_2, propLng, 10.0001, 1000));
		result = (Bindings)ScriptUtil.getInstance().execJavaScript(code, values);
		Assert.assertEquals(result.get(THING_1), false);
		Assert.assertEquals(result.get(THING_2), true);

		list.add(new PropertyValue(THING_1, propLat, 10.0002, 2000));
		list.add(new PropertyValue(THING_1, propLng, 10.0002, 2000));
		result = (Bindings)ScriptUtil.getInstance().execJavaScript(code, values);
		Assert.assertEquals(result.get(THING_1), false);
		Assert.assertEquals(result.get(THING_2), true);

		list.add(new PropertyValue(THING_2, propLat, 10.0003, 3000));
		list.add(new PropertyValue(THING_2, propLng, 10.0003, 3000));
		result = (Bindings)ScriptUtil.getInstance().execJavaScript(code, values);
		Assert.assertEquals(result.get(THING_1), false);
		Assert.assertEquals(result.get(THING_2), false);

		list.add(new PropertyValue(THING_1, propLat, 10.00005, 5000));
		list.add(new PropertyValue(THING_1, propLng, 10.00005, 5000));
		result = (Bindings)ScriptUtil.getInstance().execJavaScript(code, values);
		Assert.assertEquals(result.get(THING_1), true);
		Assert.assertEquals(result.get(THING_2), false);

	}

	public void testRemainingMileage() throws IOException {
		String srcUtil = ScriptUtil.getScriptCode("util/geo");
		String src = ScriptUtil.getScriptCode("mileageRemaining");
		String code = srcUtil + "\n" + src;
		Map<String,Object> values = new ConcurrentHashMap<>();
		LinkedList<PropertyValue> list = new LinkedList<PropertyValue>();
		Property propLat = new Property("location.latitude");
		Property propLng = new Property("location.longitude");
		Property propGas = new Property("gasLevel");
		values.put("VALUES", list);
		values.put("CONFIG", JSONUtil.fromJSON("{"
				+ "\"center\": {"
				+ "\"latitude\": 10.0001, \"longitude\": 10.0001"
				+ "}, "
				+ "\"diameter\": 10"
				+ "}", Map.class));

		list.add(new PropertyValue(propLat, 10, 0));
		list.add(new PropertyValue(propLng, 10, 0));
		list.add(new PropertyValue(propGas, 98, 0));
		double result = (Double)ScriptUtil.getInstance().execJavaScript(code, values);

		list.add(new PropertyValue(propLat, 10.0001, 1000));
		list.add(new PropertyValue(propLng, 10.0001, 1000));
		list.add(new PropertyValue(propGas, 97, 1000));
		result = (Double)ScriptUtil.getInstance().execJavaScript(code, values);
		Assert.assertEquals(result, Double.POSITIVE_INFINITY);

		list.add(new PropertyValue(propLat, 10.0002, 2000));
		list.add(new PropertyValue(propLng, 10.0002, 2000));
		list.add(new PropertyValue(propGas, 95.5, 1000));
		result = (Double)ScriptUtil.getInstance().execJavaScript(code, values);
		Assert.assertEquals(result, 4281.58973, 0.00001);

		list.add(new PropertyValue(propLat, 10.0004, 3000));
		list.add(new PropertyValue(propLng, 10.0004, 3000));
		list.add(new PropertyValue(propGas, 94.2, 1000));
		result = (Double)ScriptUtil.getInstance().execJavaScript(code, values);
		Assert.assertEquals(result, 3372.30303, 0.00001);

		list.add(new PropertyValue(propLat, 10.0006, 4000));
		list.add(new PropertyValue(propLng, 10.0006, 4000));
		list.add(new PropertyValue(propGas, 92.4, 4000));
		result = (Double)ScriptUtil.getInstance().execJavaScript(code, values);
		Assert.assertEquals(result, 3282.62840, 0.00001);
	}

}
