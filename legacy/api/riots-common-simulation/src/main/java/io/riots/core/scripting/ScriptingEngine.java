package io.riots.core.scripting;

import java.util.Map;

import javax.script.SimpleBindings;

import org.springframework.core.io.Resource;
import org.springframework.scripting.ScriptSource;
import org.springframework.scripting.groovy.GroovyScriptEvaluator;
import org.springframework.scripting.support.ResourceScriptSource;
import org.springframework.scripting.support.StaticScriptSource;

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

}
