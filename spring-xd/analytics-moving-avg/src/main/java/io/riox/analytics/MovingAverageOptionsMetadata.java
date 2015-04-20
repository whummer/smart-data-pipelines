package io.riox.analytics;

import org.springframework.xd.module.options.spi.ModuleOption;

/**
 * Holds options for the {@link MovingAverage} module
 *
 * @author riox
 */
public class MovingAverageOptionsMetadata {

    private int items = 10;

    public int getItems() {
        return items;
    }

    @ModuleOption("The number of items to use for the moving average (default: 10).")
    public void setItems(int items) {
        this.items = items;
    }

}