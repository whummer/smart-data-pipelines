package io.riox.analytics;

import org.springframework.xd.module.options.spi.ModuleOption;

/**
 * Holds options for the {@link MovingAverage} module
 *
 * @author riox
 */
public class MovingAverageOptionsMetadata {

	private int items = 10;
	private String itemPath;

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

}