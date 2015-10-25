package io.riox.xd.modules.processor.regex;

import org.springframework.xd.module.options.spi.ModuleOption;

/**
 * Module options for the {@code splitter} processor module
 *
 * @author: Waldemar Hummer
 */
public class RegexProcessorOptionMetadata {

	private volatile String field = null;

	private volatile String targetField = null;

	private volatile String regex = null;

	private volatile String replace = null;

	public String getField() {
		return field;
	}
	
	@ModuleOption("Name of the field to apply the regex to")
	public void setField(String field) {
		this.field = field;
	}
	
	public String getTargetField() {
		return targetField;
	}

	@ModuleOption("Target field to write the replaced string to. If null, overwrites the field given as 'field' option.")
	public void setTargetField(String targetField) {
		this.targetField = targetField;
	}

	public String getRegex() {
		return regex;
	}

	@ModuleOption("Regex expression (Java regex syntax).")
	public void setRegex(String regex) {
		this.regex = regex;
	}
	
	public String getReplace() {
		return replace;
	}

	@ModuleOption("Replace expression (Java regex syntax).")
	public void setReplace(String replace) {
		this.replace = replace;
	}
}
