package io.riox.xd.modules.processor.aggregator;

import io.riox.xd.modules.processor.aggregator.AggregatorMessageHandler.AggregationType;

import org.springframework.xd.module.options.spi.ModuleOption;

/**
 * Module options for the {@code aggregator} processor module
 *
 * @author: Waldemar Hummer
 */
public class AggregatorProcessorOptionMetadata {

	private volatile AggregationType type = null;

	private volatile String fields = null;

	private volatile String groupBy = null;

	private volatile String discriminators = null;

	private volatile Boolean append = true;

	public AggregationType getType() {
		return type;
	}

	@ModuleOption("Type of aggregations to apply. Either of {SUM, MIN, MAX}")
	public void setType(AggregationType type) {
		this.type = type;
	}
	
	public String getFields() {
		return fields;
	}

	@ModuleOption("Fields to aggregate")
	public void setFields(String fields) {
		this.fields = fields;
	}

	public String getGroupBy() {
		return groupBy;
	}

	@ModuleOption("Name of field to group this aggregation by.")
	public void setGroupBy(String groupBy) {
		this.groupBy = groupBy;
	}

	public String getDiscriminators() {
		return discriminators;
	}

	@ModuleOption("Comma-separated list of discriminator fields. These fields identify unique documents within a group.")
	public void setDiscriminators(String discriminators) {
		this.discriminators = discriminators;
	}

	public Boolean getAppend() {
		return append;
	}

	@ModuleOption("Whether to append the aggregate value to messages (=true) or return only the aggregate value (=false).")
	public void setAppend(Boolean append) {
		this.append = append;
	}
}
