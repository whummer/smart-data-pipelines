package io.riots.api.services.drivers;

import io.riots.api.services.scenarios.PropertyValue;

import java.util.List;

public interface SimulationDriver {

	void sendProperties(List<PropertyValue> props);

}
