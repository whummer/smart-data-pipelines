package io.riots.core.triggers;

import io.riots.api.services.scenarios.PropertyValue;
import io.riots.api.services.triggers.ThingPropsFunction;
import io.riots.core.handlers.query.PropertyValueQuery;
import io.riots.core.jms.EventBroker;
import io.riots.core.jms.EventBrokerComponent;
import io.riots.core.util.JSONUtil;
import io.riots.core.util.script.ScriptUtil;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class TriggerFunctionListener {

	private static final Logger LOG = Logger.getLogger(TriggerFunctionListener.class);
	private static final String VAR_NAME_VALUES = "VALUES";
	private static final String VAR_NAME_CONFIG = "CONFIG";

	@Autowired
	private EventBrokerComponent eventBroker;
	@Autowired
	private PropertyValueQuery propValQuery;

	private Map<String,FuncExecState> functions = new ConcurrentHashMap<>();

	private static class FuncExecState {
		ThingPropsFunction function;
		String code;
		Map<String,Object> variables = new ConcurrentHashMap<>();
	}

	@JmsListener(containerFactory = EventBroker.CONTAINER_FACTORY_NAME, 
			destination = EventBroker.MQ_INBOUND_PROP_UPDATE, 
			concurrency = "1")
	public void processEvent(String data) {
		PropertyValue prop = JSONUtil.fromJSON(data, PropertyValue.class);
		if(prop == null || prop.getPropertyName() == null) {
			LOG.warn("Received null property: " + prop);
			return;
		}

		//System.out.println("--> " + functions);
		for(FuncExecState s : functions.values()) {
			boolean thingMatches = StringUtils.isEmpty(s.function.getThingId()) ||
					prop.getThingId().matches(s.function.getThingId());
			boolean propMatches = StringUtils.isEmpty(s.function.getPropertyName()) ||
					prop.getPropertyName().matches(s.function.getPropertyName());
			if(thingMatches && propMatches) {
				executeFunction(s, prop);
			}
		}
	}

	public ThingPropsFunction addFunction(ThingPropsFunction function) {
		try {
			if(StringUtils.isEmpty(function.getId())) {
				function.setId(UUID.randomUUID().toString());
			}
			if(function.getConfig() == null) {
				function.setConfig(new HashMap<String,Object>());
			}

			/* include util functions TODO make configurable */
			String srcUtil = ScriptUtil.getScriptCode("util/geo");
			/* load requested script code */
			String src = ScriptUtil.getScriptCode(function.getFunction());

			FuncExecState state = new FuncExecState();
			functions.put(function.getId(), state);
			state.code = srcUtil + "\n" + src;
			state.function = function;
			List<PropertyValue> values = propValQuery.retrieveValues(function.getThingId(), 
					function.getPropertyName(), (int)function.getWindowSize());
			values = new LinkedList<PropertyValue>(values); // make modifiable list
			state.variables.put(VAR_NAME_VALUES, values);
			state.variables.put(VAR_NAME_CONFIG, function.getConfig());
		} catch (Exception e) {
			LOG.warn("Unable to add trigger function", e);
		}
		return function;
	}

	private void executeFunction(FuncExecState s, PropertyValue prop) {
		@SuppressWarnings("unchecked")
		List<PropertyValue> list = (List<PropertyValue>) s.variables.get(VAR_NAME_VALUES);
		list.add(prop);
		while(s.variables.size() > s.function.getWindowSize()) {
			list.remove(0);
		}
		Object result = ScriptUtil.getInstance().execJavaScript(s.code, s.variables);
		if(result != null) {
			// fire event
			PropertyValue propValue = new PropertyValue();
			propValue.setPropertyName(s.function.getResultPropertyName());
			propValue.setThingId(prop.getThingId());
			propValue.setValue(result);
			propValue.setTimestamp(prop.getTimestamp());
			eventBroker.sendOutboundChangeNotifyMessage(propValue);
		}
	}

}
