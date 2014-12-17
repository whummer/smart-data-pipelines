package io.riots.core.model.driver;

import io.riots.core.model.PropertyValue;

import java.util.List;

public interface SimulationDriver {

	void sendProperties(List<PropertyValue<?>> props);

}
