//package io.riots.core.sim;
//
//import io.riots.core.scripting.ScriptingEngine;
//import io.riots.services.catalog.ThingType;
//import io.riots.services.scenario.Thing;
//import io.riots.services.sim.Simulation;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//import org.springframework.core.io.ClassPathResource;
//
//@Deprecated
//// TODO still needed?
//public class SimulationSolver {
//
//	public void solve(Simulation sim) {
//
//		Map<String,Object> vars = new HashMap<>();
//
//		List<String> things = sim.getThings();
//
//		vars.put("THINGS", things);
//		vars.put("STARTTIME", 1);
//		vars.put("ENDTIME", 3);
//		Object result = new ScriptingEngine().eval(
//				new ClassPathResource("solver.groovy"), vars);
//		System.out.println(result.getClass());
//		System.out.println(result);
//	}
//
//	public static void main(String[] args) {
//
//		Simulation sim = new Simulation();
//		Thing d1 = new Thing("d1");
//		Thing d2 = new Thing("d2");
//		Thing d3 = new Thing("d3");
//		Thing d4 = new Thing("d4");
//		ThingType dt1 = new ThingType("dt1");
//		ThingType dt2 = new ThingType("dt2");
//		ThingType dt3 = new ThingType("dt3");
//		d1.setThingTypeId(dt1.getId());
//		d2.setThingTypeId(dt2.getId());
//		d3.setThingTypeId(dt3.getId());
//		d4.setThingTypeId(dt3.getId());
//		sim.getThings().add(d1.getId());
//		sim.getThings().add(d2.getId());
//		sim.getThings().add(d3.getId());
//		sim.getThings().add(d4.getId());
//
////		List<Thing> things = sim.getThings();
////		List<ThingType> thingTypes = new LinkedList<ThingType>();
////		for(Thing d : things) {
////			ThingType tt = new ThingType();
////			tt.setId(d.getThingTypeId());
////			thingTypes.add(tt);
////		}
////		for(ThingType dt : thingTypes) {
////			Property p1 = new Property("p1");
////			Property p2 = new Property("p2");
////			p1.setValueDomain(new ValueDomainEnumerated<>("s1", "s2", "s3"));
////			p2.setValueDomain(new ValueDomainDiscrete<Double>(0.0, 10.0, 1.0));
////			dt.getProperties().add(p1);
////			dt.getProperties().add(p2);
////		}
////	
////		new SimulationSolver().solve(sim);
//	}
//
//}
