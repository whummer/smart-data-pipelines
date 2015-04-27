package io.riox.transform;

import org.springframework.xd.module.options.spi.ModuleOption;

/**
 * Holds options for the {@link DataContentFilter} module
 *
 * @author riox
 */
public class DataContentFilterOptionsMetadata {

	private String excludes;

	public String getExcludes() {
		return excludes;
	}

	@ModuleOption(value = "A comma-separated list of data items to exlude.")
	public void setExcludes(String excludes) {
		this.excludes = excludes;
	}

}