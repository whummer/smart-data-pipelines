package io.riox.xd.modules.processor.splitter;

import org.springframework.xd.module.options.spi.ModuleOption;

/**
 * Module options for the {@code splitter} processor module
 *
 * @author: Waldemar Hummer
 */
public class SplitterProcessorOptionMetadata {

	private volatile String mapping = null;

	public String getMapping() {
		return mapping;
	}
	
	@ModuleOption("Apply a map step before enriching. E.g., 'id.*:id:value' turns {id1:v2,id2:v2} into [{id:id1,value:v1},{id:id2,value:v2}]")
	public void setMapping(String mapping) {
		this.mapping = mapping;
	}
}
