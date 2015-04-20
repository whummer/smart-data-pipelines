package io.riots.core.triggers;

import io.riots.api.services.catalog.Property;
import io.riots.api.services.scenarios.PropertyValue;
import io.riots.api.services.triggers.ThingPropsFunction;
import io.riots.core.util.JSONUtil;
import io.riots.core.util.script.ScriptUtil;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import javax.script.Bindings;
import javax.script.ScriptEngine;

import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * @author whummer
 */
@Test
public class TriggerFunctionsTest {

	public void testSpeedCalc() throws IOException {
		String srcUtil = ScriptUtil.getScriptCode(TriggerFunctionListener.SRC_FILE_UTIL);
		String src = ScriptUtil.getScriptCode("speed");
		String code = srcUtil + "\n" + src;
		Map<String,Object> values = new ConcurrentHashMap<>();
		Property propLoc = new Property("location");

		/* init script engine */
		ScriptEngine engine = ScriptUtil.getEngineJS();
		ScriptUtil.eval(engine, "VALUES = []");
		ScriptUtil.bindVariables(engine, values);
		ScriptUtil.eval(engine, code);

		/* START TESTS */

		add(engine, new PropertyValue(propLoc, JSONUtil.fromJSON(
				"{\"latitude\": 10, \"longitude\": 10}", Map.class), 0));

		add(engine, new PropertyValue(propLoc, JSONUtil.fromJSON(
				"{\"latitude\": 10.0001, \"longitude\": 10.0001}", Map.class), 1000));

		add(engine, new PropertyValue(propLoc, JSONUtil.fromJSON(
				"{\"latitude\": 10.0002, \"longitude\": 10.0002}", Map.class), 2000));

		add(engine, new PropertyValue(propLoc, JSONUtil.fromJSON(
				"{\"latitude\": 10.0003, \"longitude\": 10.0003}", Map.class), 3000));

		double result = (Double)ScriptUtil.runMain(engine);
		Assert.assertEquals(result, 15.60634, 0.000001);
	}

	public void testGasUsageCalc() throws IOException {
		String srcUtil = ScriptUtil.getScriptCode(TriggerFunctionListener.SRC_FILE_UTIL);
		String src = ScriptUtil.getScriptCode("gasUsage");
		String code = srcUtil + "\n" + src;
		Map<String,Object> values = new ConcurrentHashMap<>();
		Property propLoc = new Property("location");
		Property propLevel = new Property("batteryPercent");
		ThingPropsFunction func = new ThingPropsFunction();
		func.setConfig(JSONUtil.fromJSON("{"
				+ "\"levelPropName\": \"batteryPercent\", "
				+ "\"consumptionPercentPerKm\": 1"
				+ "}", Map.class));

		/* init script engine */
		ScriptEngine engine = ScriptUtil.getEngineJS();
		ScriptUtil.eval(engine, "VALUES = []");
		values.put(TriggerFunctionListener.VAR_NAME_CONFIG, func.getConfig());
		ScriptUtil.bindVariables(engine, values);
		ScriptUtil.eval(engine, code);

		/* START TESTS */

		add(engine, new PropertyValue(propLoc, JSONUtil.fromJSON(
				"{\"latitude\": 10, \"longitude\": 10}", Map.class), 0));
		double result = (Double)ScriptUtil.runMain(engine);
		Assert.assertEquals(result, 100, 0.000001);

		add(engine, new PropertyValue(propLevel, result, 1000));
		add(engine, new PropertyValue(propLoc, JSONUtil.fromJSON(
				"{\"latitude\": 10.0001, \"longitude\": 10.0001}", Map.class), 1000));

		add(engine, new PropertyValue(propLoc, JSONUtil.fromJSON(
				"{\"latitude\": 10.0002, \"longitude\": 10.0002}", Map.class), 2000));

		add(engine, new PropertyValue(propLoc, JSONUtil.fromJSON(
				"{\"latitude\": 10.0003, \"longitude\": 10.0003}", Map.class), 3000));
		result = (Double)ScriptUtil.runMain(engine);
		Assert.assertEquals(result, 99.95318, 0.000001);

		add(engine, new PropertyValue(propLevel, result, 5000));
		add(engine, new PropertyValue(propLoc, JSONUtil.fromJSON(
				"{\"latitude\": 10.005, \"longitude\": 10.005}", Map.class), 5000));
		result = (Double)ScriptUtil.runMain(engine);
		Assert.assertEquals(result, 99.2196858, 0.000001);
	}

	public void testGeoFence() throws IOException {
		String srcUtil = ScriptUtil.getScriptCode(TriggerFunctionListener.SRC_FILE_UTIL);
		String src = ScriptUtil.getScriptCode("geoFence");
		String code = srcUtil + "\n" + src;
		Map<String,Object> values = new ConcurrentHashMap<>();
		Property propLat = new Property("location.latitude");
		Property propLng = new Property("location.longitude");
		ThingPropsFunction func = new ThingPropsFunction();
		func.setConfig(JSONUtil.fromJSON("{"
				+ "\"center\": {"
				+ "\"latitude\": 10.0001, \"longitude\": 10.0001"
				+ "}, "
				+ "\"diameter\": 10"
				+ "}", Map.class));
		String fenceId = UUID.randomUUID().toString();
		func.setId(fenceId);
		values.put(TriggerFunctionListener.VAR_NAME_FUNCTION, func);
		values.put(TriggerFunctionListener.VAR_NAME_CONFIG, func.getConfig());
		/* init script engine */
		ScriptEngine engine = ScriptUtil.getEngineJS();
		ScriptUtil.eval(engine, "VALUES = []");
		ScriptUtil.bindVariables(engine, values);
		ScriptUtil.eval(engine, code);

		/* START TESTS */

		String THING_1 = "thing1";
		String THING_2 = "thing2";

		add(engine, new PropertyValue(THING_1, propLat, 10, 0));
		add(engine, new PropertyValue(THING_1, propLng, 10, 0));

		Bindings result = (Bindings)ScriptUtil.runMain(engine);
		Assert.assertEquals(result.get(fenceId), false);

		add(engine, new PropertyValue(THING_2, propLat, 10.0001, 1000));
		add(engine, new PropertyValue(THING_2, propLng, 10.0001, 1000));
		result = (Bindings)ScriptUtil.runMain(engine);
		Assert.assertEquals(result.get(fenceId), true);

		add(engine, new PropertyValue(THING_1, propLat, 10.0002, 2000));
		add(engine, new PropertyValue(THING_1, propLng, 10.0002, 2000));
		result = (Bindings)ScriptUtil.runMain(engine);
		Assert.assertEquals(result.get(fenceId), false);

		add(engine, new PropertyValue(THING_2, propLat, 10.0003, 3000));
		add(engine, new PropertyValue(THING_2, propLng, 10.0003, 3000));
		result = (Bindings)ScriptUtil.runMain(engine);
		Assert.assertEquals(result.get(fenceId), false);

		for(int i = 5; i < 15; i ++) {
			add(engine, new PropertyValue(THING_1, propLat, 10.00005, i*1000));
			add(engine, new PropertyValue(THING_1, propLng, 10.00005, i*1000));
			result = (Bindings)ScriptUtil.runMain(engine);
			Assert.assertEquals(result.get(fenceId), true);
		}

	}

	public void testRemainingMileage() throws IOException {
		String srcUtil = ScriptUtil.getScriptCode(TriggerFunctionListener.SRC_FILE_UTIL);
		String src = ScriptUtil.getScriptCode("mileageRemaining");
		String code = srcUtil + "\n" + src;
		Map<String,Object> values = new ConcurrentHashMap<>();
		Property propLat = new Property("location.latitude");
		Property propLng = new Property("location.longitude");
		Property propGas = new Property("gasLevel");
		values.put("CONFIG", JSONUtil.fromJSON("{"
				+ "\"center\": {"
				+ "\"latitude\": 10.0001, \"longitude\": 10.0001"
				+ "}, "
				+ "\"diameter\": 10"
				+ "}", Map.class));
		/* init script engine */
		ScriptEngine engine = ScriptUtil.getEngineJS();
		ScriptUtil.eval(engine, "VALUES = []");
		ScriptUtil.bindVariables(engine, values);
		ScriptUtil.eval(engine, code);

		/* START TESTS */

		add(engine, new PropertyValue(propLat, 10, 0));
		add(engine, new PropertyValue(propLng, 10, 0));
		add(engine, new PropertyValue(propGas, 98, 0));
		double result = (Double)ScriptUtil.runMain(engine);

		add(engine, new PropertyValue(propLat, 10.0001, 1000));
		add(engine, new PropertyValue(propLng, 10.0001, 1000));
		add(engine, new PropertyValue(propGas, 97, 1000));
		result = (Double)ScriptUtil.runMain(engine);
		Assert.assertEquals(result, Double.POSITIVE_INFINITY);

		add(engine, new PropertyValue(propLat, 10.0002, 2000));
		add(engine, new PropertyValue(propLng, 10.0002, 2000));
		add(engine, new PropertyValue(propGas, 95.5, 1000));
		result = (Double)ScriptUtil.runMain(engine);
		Assert.assertEquals(result, 4281.58973, 0.00001);

		add(engine, new PropertyValue(propLat, 10.0004, 3000));
		add(engine, new PropertyValue(propLng, 10.0004, 3000));
		add(engine, new PropertyValue(propGas, 94.2, 1000));
		result = (Double)ScriptUtil.runMain(engine);
		Assert.assertEquals(result, 3372.30303, 0.00001);

		add(engine, new PropertyValue(propLat, 10.0006, 4000));
		add(engine, new PropertyValue(propLng, 10.0006, 4000));
		add(engine, new PropertyValue(propGas, 92.4, 4000));
		result = (Double)ScriptUtil.runMain(engine);
		Assert.assertEquals(result, 3282.62840, 0.00001);
	}

	/* HELPER METHODS */

	private void add(ScriptEngine engine, PropertyValue propertyValue) {
		ScriptUtil.pushToList(engine, "VALUES", propertyValue);
	}
//	private void add(List<Object> list, PropertyValue propertyValue) {
//		list.add(JSONUtil.clone(propertyValue));
//	}

}
