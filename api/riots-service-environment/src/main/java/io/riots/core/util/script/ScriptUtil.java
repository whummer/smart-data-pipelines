package io.riots.core.util.script;

import java.io.IOException;
import java.util.Map;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import org.apache.cxf.helpers.IOUtils;
import org.apache.log4j.Logger;

/**
 * Utility methods for executing script code.
 * @author whummer
 */
public class ScriptUtil {

	private static final ScriptUtil INSTANCE = new ScriptUtil();
	private static final Logger LOG = Logger.getLogger(ScriptUtil.class);

	private final ScriptEngineManager factory = new ScriptEngineManager();

	private ScriptUtil() {}

	public Object execJavaScript(String src) {
		return execJavaScript(src, null);
	}
	public Object execJavaScript(String src, Map<String,?> variables) {
		try {
			ScriptEngine engine = factory.getEngineByName("JavaScript");
			if(variables != null) {
				for(String key : variables.keySet()) {
					engine.put(key, variables.get(key));
				}
			}
			Object obj = engine.eval(src);
			return obj;
		} catch (Exception e) {
			LOG.info("Unable to execute JS code: " + src, e);
			throw new RuntimeException(e);
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

}
