package io.riots.core.model.driver;

import io.riots.services.scenario.PropertyValue;

import java.util.List;

public interface SimulationDriver {

	void sendProperties(List<PropertyValue<?>> props);

}
