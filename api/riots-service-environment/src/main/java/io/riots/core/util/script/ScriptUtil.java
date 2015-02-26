package io.riots.core.util.script;

import java.io.IOException;
import java.util.Map;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.cxf.helpers.IOUtils;
import org.apache.log4j.Logger;

/**
 * Utility methods for executing script code.
 * @author whummer
 */
public class ScriptUtil {

	private static final ScriptUtil INSTANCE = new ScriptUtil();
	private static final Logger LOG = Logger.getLogger(ScriptUtil.class);

	private static final ScriptEngineManager factory = new ScriptEngineManager();

	private ScriptUtil() {}

	public Object execJavaScript(String src) {
		return execJavaScript(src, null);
	}
	public Object execJavaScript(String src, Map<String,?> variables) {
		try {
			double t1 = System.currentTimeMillis();
			ScriptEngine engine = getEngineJS();
			if(variables != null) {
				for(String key : variables.keySet()) {
					engine.put(key, variables.get(key));
				}
			}
			double t2 = System.currentTimeMillis();
			System.out.println("t0: " + Math.abs(t1 - t2));
			Object obj = engine.eval(src);
			t1 = System.currentTimeMillis();
			System.out.println("t1: " + Math.abs(t1 - t2));
			System.out.println("VALUES.length " + engine.eval("VALUES.length"));
			return obj;
		} catch (Exception e) {
			LOG.info("Unable to execute JS code: " + src, e);
			throw new RuntimeException(e);
		}
	}

	public static void bindVariables(ScriptEngine engine, Map<String, Object> variables) {
		if(variables != null) {
			for(String key : variables.keySet()) {
				engine.put(key, variables.get(key));
			}
		}
	}


	public static ScriptUtil getInstance() {
		return INSTANCE;
	}

	public static String getScriptCode(String name) throws IOException {
		String src = IOUtils.readStringFromStream(
				ScriptUtil.class.getResourceAsStream(
						"/triggers/" + name + ".js"));
		return src;
	}

	public static ScriptEngine getEngineJS() {
		return factory.getEngineByName("JavaScript");
	}

	public static Object eval(ScriptEngine engine, String src) {
		try {
			return engine.eval(src);
		} catch (ScriptException e) {
			LOG.info("Unable to execute JS code: " + src, e);
			throw new RuntimeException(e);
		}
	}
	
	public static Object runMain(ScriptEngine engine) {
		return eval(engine, "main()");
	}

}
