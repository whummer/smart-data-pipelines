package io.riots.core.util;

import java.io.File;
import java.io.FileInputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.apache.cxf.helpers.IOUtils;
import org.apache.log4j.Logger;

/**
 * Access configuration values.
 * 
 * Configuration files are JSON-encoded. 
 * They are loaded in the following order 
 * (values are overriden):
 * - ~/.riox
 * 
 * @author whummer
 */
public class Config {

	private static final String CONFIG_FILE_HOME = System.getProperty("user.home") + "/.riox";
	private static final Logger LOG = Logger.getLogger(Config.class);
	private static final Map<String,Object> configs = new HashMap<String, Object>();

	static {
		loadConfigs();
	}

	@SuppressWarnings("unchecked")
	public static <T> T get(String key) {
		return (T)getValue(key.split("\\."));
	}

	/* PRIVATE HELPER METHODS */

	private static Object getValue(String[] keys) {
		return getValue(configs, keys);
	}
	@SuppressWarnings("unchecked")
	private static Object getValue(Map<String, Object> map, String[] keys) {
		String key = keys[0];
		Object entry = map.get(key);
		if(keys.length == 1) {
			return entry;
		}
		if(!(entry instanceof Map<?,?>)) {
			return null;
		}
		keys = Arrays.copyOfRange(keys, 1, keys.length);
		return getValue((Map<String,Object>)entry, keys);
	}

	private static void loadConfigs() {
		loadConfig(CONFIG_FILE_HOME);
		LOG.info("Loaded configuration: " + configs);
	}
	private static void loadConfig(String file) {
		try {
			if(!new File(file).exists()) {
				return;
			}
			String json = IOUtils.readStringFromStream(new FileInputStream(file));
			@SuppressWarnings("unchecked")
			Map<String,Object> map = JSONUtil.fromJSON(json, Map.class);
			mergeConfig(map);
		} catch (Exception e) {
			LOG.warn("Unable to load configuration: ", e);
		}
	}
	private static void mergeConfig(Map<String,Object> map) {
		mergeConfig(map, configs);
	}
	@SuppressWarnings("unchecked")
	private static void mergeConfig(Map<String,Object> source, Map<String,Object> target) {
		for(String key : source.keySet()) {
			Object src = source.get(key);
			if(!target.containsKey(key)) {
				target.put(key, src);
			} else {
				Object tgt = target.get(key);
				if(src instanceof Map<?,?> && tgt instanceof Map<?,?>) {
					mergeConfig((Map<String,Object>)src, (Map<String,Object>)tgt);
				} else {
					LOG.info("Overwriting config value: '" + key + "' = " + src + " (was: " + tgt + ")");
					target.put(key, src);
				}
			}
		}
	}

}
