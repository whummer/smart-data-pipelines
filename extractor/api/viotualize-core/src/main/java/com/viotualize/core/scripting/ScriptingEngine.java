package com.viotualize.core.scripting;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.script.SimpleBindings;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.scripting.ScriptSource;
import org.springframework.scripting.groovy.GroovyScriptEvaluator;
import org.springframework.scripting.support.ResourceScriptSource;
import org.springframework.scripting.support.StaticScriptSource;

import com.viotualize.core.domain.Device;
import com.viotualize.core.domain.DeviceType;
import com.viotualize.core.domain.Property;
import com.viotualize.core.domain.ValueDomain;

/**
 * Scripting engine used for specificying the behavior of simulations.
 * @author Waldemar Hummer
 */
public class ScriptingEngine {

	private GroovyScriptEvaluator eng = new GroovyScriptEvaluator();

	public Object eval(String script) {
		return eval(script, null);
	}
	public Object eval(Resource script, Map<String, Object> variables) {
		return eval(new ResourceScriptSource(script), variables);
	}
	public Object eval(String script, Map<String, Object> variables) {
		return eval(new StaticScriptSource(script), variables);
	}
	public Object eval(ScriptSource script, Map<String, Object> variables) {
		try {
			Object result = null;
			if (variables != null) {
				result = eng.evaluate(script,
						new SimpleBindings(variables));
			} else {
				result = eng.evaluate(script);
			}
			return result;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public static Object exec(String script, Map<String, Object> variables) {
		return new ScriptingEngine().eval(script, variables);
	}

	public static void main(String[] args) {

		Map<String,Object> vars = new HashMap<>();
		List<Device> devices = new LinkedList<Device>();
		List<DeviceType> deviceTypes = new LinkedList<DeviceType>();
		Device d1 = new Device("d1");
		Device d2 = new Device("d2");
		Device d3 = new Device("d3");
		Device d4 = new Device("d4");
		DeviceType dt1 = new DeviceType("dt1");
		DeviceType dt2 = new DeviceType("dt2");
		DeviceType dt3 = new DeviceType("dt3");
		d1.setAssetType(dt1);
		d2.setAssetType(dt2);
		d3.setAssetType(dt3);
		d4.setAssetType(dt3);
		devices.add(d1);
		devices.add(d2);
		devices.add(d3);
		devices.add(d4);

		//List<EntityWrapper> deviceWrappers = new LinkedList<>();
		for(Device d : devices) {
			//deviceWrappers.add(new EntityWrapper(d));
			deviceTypes.add(d.getAssetType());
			//vars.put(d.getName(), new EntityWrapper(d));
			//vars.put(d.getName(), d);
		}
		for(DeviceType dt : deviceTypes) {
			Property<String> p1 = new Property.PropertyString("p1");
			Property<Double> p2 = new Property.PropertyDouble("p2");
			p1.setValueDomain(new ValueDomain.EnumerationVD<>("s1", "s2", "s3"));
			p2.setValueDomain(new ValueDomain.DiscreteVD<Double>(0.0, 10.0, 1.0));
			dt.getDeviceProperties().add(p1);
			dt.getDeviceProperties().add(p2);
			//vars.put(dt.getName(), new EntityWrapper(dt));
		}
		//vars.put("DEVICES", deviceWrappers);
		vars.put("DEVICES", devices);
		vars.put("STARTTIME", 1);
		vars.put("ENDTIME", 3);
		new ScriptingEngine().eval(new ClassPathResource("solver.groovy"), vars);
	}
}
