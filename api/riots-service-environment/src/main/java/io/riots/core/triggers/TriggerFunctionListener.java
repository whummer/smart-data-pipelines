package io.riots.core.triggers;

import io.riots.api.services.scenarios.PropertyValue;
import io.riots.api.services.triggers.ThingPropsFunction;
import io.riots.core.handlers.query.PropertyValueQuery;
import io.riots.core.jms.EventBroker;
import io.riots.core.jms.EventBrokerComponent;
import io.riots.core.util.JSONUtil;
import io.riots.core.util.script.ScriptUtil;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import javax.script.ScriptEngine;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

/**
 * @author whummer
 */
@Component
public class TriggerFunctionListener {

	public static final String VAR_NAME_VALUES = "VALUES";
	public static final String VAR_NAME_CONFIG = "CONFIG";
	public static final String VAR_NAME_FUNCTION = "FUNCTION";
	public static final String SRC_FILE_UTIL = "util/common";
	private static final Logger LOG = Logger.getLogger(TriggerFunctionListener.class);
	@Autowired
	private EventBrokerComponent eventBroker;
	@Autowired
	private PropertyValueQuery propValQuery;

	private Map<String, FuncExecState> functions = new ConcurrentHashMap<>();

	@JmsListener(containerFactory = EventBroker.CONTAINER_FACTORY_NAME,
			destination = EventBroker.MQ_INBOUND_PROP_UPDATE,
			concurrency = "1")
	public void processEvent(String data) {
		//LOG.info("Got data: " + data);
		PropertyValue prop = JSONUtil.fromJSON(data, PropertyValue.class);
		if (prop == null || prop.getPropertyName() == null) {
			LOG.warn("Received null property: " + prop);
			return;
		}

		//System.out.println("--> " + functions);
		for (FuncExecState s : functions.values()) {
			boolean thingMatches = StringUtils.isEmpty(s.function.getThingId()) ||
					prop.getThingId().matches(s.function.getThingId());
			boolean propMatches = StringUtils.isEmpty(s.function.getPropertyName()) ||
					prop.getPropertyName().matches(s.function.getPropertyName());
			boolean triggerPropMatches = StringUtils.isEmpty(s.function.getTriggerPropertyName()) ||
					prop.getPropertyName().matches(s.function.getTriggerPropertyName());

			boolean doAddValue = thingMatches && propMatches;
			boolean doExecFunc = thingMatches && triggerPropMatches;

			if (doAddValue) {
				addValueToFunctionState(s, prop);
			}
			if (doExecFunc) {
				executeFunction(s, prop);
			}
			if(doAddValue || doExecFunc) {
				System.out.println("--> " + s.function + " -- " + 
						prop + " - add: "  + doAddValue + ", exec: "  + doExecFunc);
			}
		}
	}


	public ThingPropsFunction addFunction(ThingPropsFunction function) {
		try {
			if (StringUtils.isEmpty(function.getId())) {
				function.setId(UUID.randomUUID().toString());
			}
			if (StringUtils.isEmpty(function.getResultPropertyName())) {
				function.setResultPropertyName(function.getTriggerFunction());
			}
			if (StringUtils.isEmpty(function.getTriggerPropertyName())) {
				function.setTriggerPropertyName(function.getPropertyName());
			}
			if (function.getConfig() == null) {
				function.setConfig(new HashMap<String, Object>());
			}

			/* include util functions. TODO make configurable */
			String srcUtil = ScriptUtil.getScriptCode(SRC_FILE_UTIL);
			/* load requested script code */
			String src = ScriptUtil.getScriptCode(function.getTriggerFunction());

			FuncExecState state = new FuncExecState();
			functions.put(function.getId(), state);
			state.code = srcUtil + "\n" + src;
			state.function = function;
			state.engine = ScriptUtil.getEngineJS();
			state.variables.put(VAR_NAME_FUNCTION, function);
			state.variables.put(VAR_NAME_CONFIG, function.getConfig());
			ScriptUtil.eval(state.engine, VAR_NAME_VALUES + " = []");
			LOG.info("Added trigger function " + state.function);

			/* initialize code engine */
			ScriptUtil.bindVariables(state.engine, state.variables);
			ScriptUtil.eval(state.engine, state.code);
		} catch (Exception e) {
			LOG.warn("Unable to add trigger function", e);
		}
		return function;
	}


	private void addValueToFunctionState(FuncExecState s, PropertyValue prop) {
		Assert.notNull(s.engine);
		ScriptUtil.pushToList(s.engine, VAR_NAME_VALUES, prop);
		ScriptUtil.ensureListMaxSize(s.engine, VAR_NAME_VALUES, s.function.getWindowSize());
	}

	public FuncExecState removeFunction(String id) {
		FuncExecState deleted = functions.remove(id);
		System.gc();
		return deleted;
	}

	private void executeFunction(FuncExecState s, PropertyValue prop) {
		Object result = ScriptUtil.eval(s.engine, "main();");

		if(result != null) {
			// fire new event with result
			PropertyValue propValue = new PropertyValue();
			propValue.setPropertyName(s.function.getResultPropertyName());
			propValue.setThingId(prop.getThingId());
			propValue.setValue(result);
			propValue.setTimestamp(prop.getTimestamp());
			eventBroker.sendInboundPropUpdateMessage(propValue);
		}
	}


	public ThingPropsFunction updateFunction(ThingPropsFunction func) {
		FuncExecState existing = removeFunction(func.getId());
		addFunction(func);
		return existing != null ? existing.function : null;
	}

	public void removeAllFunctions() {
		functions.clear();
		System.gc();
	}

	public void removeAllForCreator(String creatorId) {
		for(String funcId : new HashSet<String>(functions.keySet())) {
			FuncExecState s = functions.get(funcId);
			if(!StringUtils.isEmpty(creatorId) && creatorId.equals(s.function.getCreatorId())) {
				functions.remove(funcId);
			}
		}
	}

	private static class FuncExecState {

		ThingPropsFunction function;
		String code;
		Map<String, Object> variables = new ConcurrentHashMap<>();
		ScriptEngine engine;
	}

}
