package io.riots.services.drivers;

import io.riots.services.scenario.PropertyValue;

import java.util.List;

public interface SimulationDriver {

	void sendProperties(List<PropertyValue> props);

}
