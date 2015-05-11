package io.riox.analytics;

import org.springframework.xd.module.options.spi.ModuleOption;

/**
 * Holds options for the {@link MovingFunction} module
 *
 * @author riox
 */
public class MovingFunctionOptionsMetadata {

	private int items = 10;
	private String itemPath;
	private String function;

	public int getItems() {
		return items;
	}

	@ModuleOption(defaultValue = "10", value = "The number of items to use for the moving average. ")
	public void setItems(int items) {
		this.items = items;
	}

	public String getItemPath() {
		return itemPath;
	}

	@ModuleOption(value = "The path to get the item from the tuple.")
	public void setItemPath(String itemPath) {
		this.itemPath = itemPath;
	}

	public String getFunction() {
		return function;
	}

	@ModuleOption(value = "The mathematical function to use (MIN, MAX, AVG, SUM).")
	public void setFunction(String function) {
		this.function = function;
	}

}