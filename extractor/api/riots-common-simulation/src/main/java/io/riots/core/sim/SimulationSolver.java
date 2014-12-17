package io.riots.core.sim;

import io.riots.core.model.Device;
import io.riots.core.model.DeviceType;
import io.riots.core.model.Property;
import io.riots.core.model.ValueDomainDiscrete;
import io.riots.core.model.ValueDomainEnumerated;
import io.riots.core.model.sim.DeviceSimulation.DeviceSimulationInstance;
import io.riots.core.model.sim.Simulation;
import io.riots.core.scripting.ScriptingEngine;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.ClassPathResource;

public class SimulationSolver {

	public void solve(Simulation sim) {

		Map<String,Object> vars = new HashMap<>();

		List<Device> devices = sim.getAllDevices();

		//vars.put("DEVICES", deviceWrappers);
		vars.put("DEVICES", devices);
		vars.put("STARTTIME", 1);
		vars.put("ENDTIME", 3);
		Object result = new ScriptingEngine().eval(
				new ClassPathResource("solver.groovy"), vars);
		System.out.println(result.getClass());
		System.out.println(result);
	}

	public static void main(String[] args) {

		Simulation sim = new Simulation();
		Device d1 = new Device("d1");
		Device d2 = new Device("d2");
		Device d3 = new Device("d3");
		Device d4 = new Device("d4");
		DeviceType dt1 = new DeviceType("dt1");
		DeviceType dt2 = new DeviceType("dt2");
		DeviceType dt3 = new DeviceType("dt3");
		d1.setAssetType(dt1);
		d2.setAssetType(dt2);
		d3.setAssetType(dt3);
		d4.setAssetType(dt3);
		sim.getDevices().add(new DeviceSimulationInstance(d1));
		sim.getDevices().add(new DeviceSimulationInstance(d2));
		sim.getDevices().add(new DeviceSimulationInstance(d3));
		sim.getDevices().add(new DeviceSimulationInstance(d4));

		List<Device> devices = sim.getAllDevices();
		List<DeviceType> deviceTypes = new LinkedList<DeviceType>();
		for(Device d : devices) {
			deviceTypes.add(d.getAssetType());
		}
		for(DeviceType dt : deviceTypes) {
			Property<String> p1 = new Property.PropertyString("p1");
			Property<Double> p2 = new Property.PropertyDouble("p2");
			p1.setValueDomain(new ValueDomainEnumerated<>("s1", "s2", "s3"));
			p2.setValueDomain(new ValueDomainDiscrete<Double>(0.0, 10.0, 1.0));
			dt.getDeviceProperties().add(p1);
			dt.getDeviceProperties().add(p2);
		}
	
		new SimulationSolver().solve(sim);
	}

}
