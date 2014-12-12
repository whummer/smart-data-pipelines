package io.riots.core.sim.traffic;

import io.hummer.osm.OpenStreetMap;
import io.hummer.osm.export.PathExporter;
import io.hummer.osm.model.Point;
import io.hummer.osm.model.Point.PathPoint;
import io.hummer.osm.model.Tile;
import io.hummer.osm.query.OSMContainer;
import io.hummer.osm.query.OSMElement;
import io.hummer.osm.query.OSMNode;
import io.hummer.osm.util.Util;
import io.riots.core.sim.ValueInterpolation;
import io.riots.core.sim.traffic.TrafficSimulatorMatsim.TrafficTraces.TrafficTrace;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;
import org.matsim.api.core.v01.Coord;
import org.matsim.api.core.v01.Scenario;
import org.matsim.api.core.v01.events.LinkEnterEvent;
import org.matsim.api.core.v01.events.handler.LinkEnterEventHandler;
import org.matsim.api.core.v01.network.Network;
import org.matsim.api.core.v01.network.Node;
import org.matsim.api.core.v01.population.Activity;
import org.matsim.api.core.v01.population.Person;
import org.matsim.api.core.v01.population.Plan;
import org.matsim.api.core.v01.population.Population;
import org.matsim.api.core.v01.population.PopulationFactory;
import org.matsim.core.config.Config;
import org.matsim.core.config.ConfigUtils;
import org.matsim.core.config.groups.PlanCalcScoreConfigGroup.ActivityParams;
import org.matsim.core.controler.Controler;
import org.matsim.core.mobsim.qsim.qnetsimengine.QVehicle;
import org.matsim.core.scenario.ScenarioImpl;
import org.matsim.core.scenario.ScenarioUtils;
import org.matsim.core.utils.geometry.CoordinateTransformation;
import org.matsim.core.utils.geometry.transformations.TransformationFactory;
import org.matsim.core.utils.io.OsmNetworkReader;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Generate realistic GPS traces of vehicles/persons traveling on the map, based
 * on the traffic simulator Matsim (http://matsim.org).
 * 
 * @author whummer
 */
public class TrafficSimulatorMatsim {

	final Map<String, List<PathPoint>> vehiclePaths = new HashMap<String, List<PathPoint>>();

	private static final double MAX_VICINITY = 0.1;
	private static final double MAX_TRACE_POINTS = 10000;
	private static final Random RAND = new Random();

	static {
		/* disable logging */
		Logger.getLogger(OsmNetworkReader.class).setLevel(Level.OFF);
		Logger.getLogger(QVehicle.class).setLevel(Level.OFF);
	}

	private Point getRandomPoint(Tile bounds, List<OSMNode> nodes) {
		if(nodes == null || nodes.isEmpty()) {
			double x = bounds.left + Math.random() * (bounds.right - bounds.left);
			double y = bounds.bottom + Math.random() * (bounds.top - bounds.bottom);
			return new Point(x, y);
		}
		/* try to find a point in the tile bounds */
		int numTries = 30;
		for(int i = 0; i < numTries; i ++) {
			Point p = nodes.get(RAND.nextInt(nodes.size())).toPoint();
			if(bounds.contains(p)) {
				return p;
			}
		}
		return nodes.get(RAND.nextInt(nodes.size())).toPoint();
	}

	private Scenario generate(int numVehicles, Tile bounds, List<OSMNode> nodes) {
		
		PropertyConfigurator.configure(getClass().getResource("/log4j.properties"));

		CoordinateTransformation ct = TransformationFactory
				.getCoordinateTransformation("WGS84", "WGS84");

		Config config = ConfigUtils.createConfig();
		config.planCalcScore().addActivityParams(new ActivityParams("startAndStop") {
			{
				setTypicalDuration(1);
				setScoringThisActivityAtAll(false);
			}
		});
		config.planCalcScore().addActivityParams(new ActivityParams("pitstop") {
			{
				setTypicalDuration(1);
				setScoringThisActivityAtAll(false);
			}
		});
		config.scenario().setUseTransit(true);
		Scenario sc = ScenarioUtils.createScenario(config);

		config.scenario().setUseTransit(false);
		config.setParam("controler", "firstIteration", "0");
		config.setParam("controler", "lastIteration", "0");

		Population population = sc.getPopulation();
		((ScenarioImpl) sc).createVehicleContainer();

		PopulationFactory populationFactory = population.getFactory();

		int numPoints = 20;

		for (int i = 1; i <= numVehicles; i++) {
			Person person = populationFactory
					.createPerson(sc.createId("p" + i));
			population.addPerson(person);

			Plan plan = populationFactory.createPlan();

			/* set starting point */
			Point p1 = getRandomPoint(bounds, nodes);
			Coord coords1 = sc.createCoord(p1.x, p1.y);
			Activity act1 = populationFactory.createActivityFromCoord(
					"startAndStop", ct.transform(coords1));
			act1.setMaximumDuration(0);
			plan.addActivity(act1);

			/* add a couple of points to drive through */
			for(int j = 1; j <= numPoints; j ++) {

				plan.addLeg(populationFactory.createLeg("car"));

				Point p2 = getRandomPoint(bounds, nodes);
				Activity act2 = populationFactory.createActivityFromCoord(
						"pitstop", ct.transform(sc.createCoord(p2.x, p2.y)));
				act2.setMaximumDuration(0);
				plan.addActivity(act2);

			}

			/* set end point */
			Point p2 = getRandomPoint(bounds, nodes);
			Coord coords2 = sc.createCoord(p2.x, p2.y);
			Activity act2 = populationFactory.createActivityFromCoord(
					"startAndStop", ct.transform(coords2));
			act2.setMaximumDuration(0);
			// use infinity, apparently this is what matsim wants (avoids a WARN output)
			act2.setEndTime((1.0D / 0.0D));
			plan.addActivity(act2);

			person.addPlan(plan);
		}

		return sc;
	}

	private void importNetwork(Scenario sc, OSMContainer map) throws Exception {
		String osm = map.toXML();

		Network net = sc.getNetwork();
		CoordinateTransformation ct = TransformationFactory
				.getCoordinateTransformation(TransformationFactory.WGS84,
						TransformationFactory.WGS84);
		OsmNetworkReader onr = new OsmNetworkReader(net, ct);
		InputStream is = new ByteArrayInputStream(osm.getBytes());
		Method m = onr.getClass().getDeclaredMethod("parse", InputStream.class);
		m.setAccessible(true);
		m.invoke(onr, is);
	}

	void dumpVehiclePaths() {
		for (String id : vehiclePaths.keySet()) {
			dumpVehiclePath(id, vehiclePaths.get(id));
		}
	}
	static void dumpVehiclePaths(TrafficTraces traces) {
		for (TrafficTrace t : traces.traces) {
			dumpVehiclePath(t.id, t.points);
		}
	}
	static void dumpVehiclePath(String id, List<PathPoint> points) {
		Util.write(new File("vehicle_" + id + ".kml"),
				PathExporter.exportKML(points));
	}

	@SuppressWarnings("deprecation")
	private Map<String, List<PathPoint>> doRunSim(int numVehicles, double lat,
			double lon, double vicinity) throws Exception {
		if(vicinity < 0 || vicinity > MAX_VICINITY) {
			throw new IllegalArgumentException("Vicinity must be > 0 and < " + MAX_VICINITY);
		}

		/* retrieve map in a sligthly larger vicinity than the actual area */
		double mapVicinity = vicinity * 1.5;
		List<OSMElement> els = OpenStreetMap.getOSMElementsInVicinity(
				lat, lon, mapVicinity);
		List<OSMNode> nodes = OpenStreetMap.getOSMNodes(els);
		/* generate scenario */
		final Scenario s = generate(numVehicles, 
				new Tile(new Point(lon, lat), vicinity), nodes);
		OSMContainer map = new OSMContainer(els);
		importNetwork(s, map);
		final Controler run = new Controler(s);
		run.setDumpDataAtEnd(false);
		run.setOverwriteFiles(true);

		run.getEvents().addHandler(new LinkEnterEventHandler() {

			public void reset(int i) {
				// System.out.println("--> reset iteration " + i);
			}
			public void handleEvent(LinkEnterEvent e) {
				String id = e.getVehicleId().toString();
				if (!vehiclePaths.containsKey(id)) {
					vehiclePaths.put(id, new LinkedList<PathPoint>());
				}
				Node from = s.getNetwork().getLinks().get(e.getLinkId())
						.getFromNode();
				vehiclePaths.get(id).add(
						new PathPoint(from.getCoord().getX(), from.getCoord()
								.getY(), e.getTime()));
			}
		});

		/* generate simulation traces */
		run.run();
		/* return */
		return vehiclePaths;
	}

	private Map<String, List<PathPoint>> runSimSafe(int numVehicles,
			double lat, double lon, double vicinity, int retries)
			throws Exception {
		try {
			return doRunSim(numVehicles, lat, lon, vicinity);
		} catch (Exception e) {
			if (retries > 0) {
				return runSimSafe(numVehicles, lat, lon, vicinity, retries - 1);
			}
			throw e;
		}
	}

	private static void trimMaxTime(List<PathPoint> points, double maxTime) {
		for(int i = 0; i < points.size(); i ++) {
			if(points.get(i).time > maxTime) {
				points.remove(i --);
			}
		}
	}

	public static class TrafficTraces {
		public static class TrafficTrace {
			@JsonProperty
			public String id;
			@JsonProperty
			public List<PathPoint> points = new LinkedList<>();
			@Override
			public String toString() {
				return "TrafficTrace [id=" + id + ", points=" + points + "]";
			}
		}
		@JsonProperty
		public List<TrafficTrace> traces = new LinkedList<>();
	}

	public static TrafficTraces generateTraces(int numVehicles,
			double lat, double lon, double vicinity) throws Exception {
		TrafficSimulatorMatsim m = new TrafficSimulatorMatsim();
		TrafficTraces result = new TrafficTraces();
		Map<String, List<PathPoint>> r = m.runSimSafe(numVehicles, lat, lon, vicinity, 2);
		for(String s : r.keySet()) {
			TrafficTrace t = new TrafficTrace();
			t.id = s;
			t.points = r.get(s);
			result.traces.add(t);
		}
		return result;
	}

	public static TrafficTraces generateTraces(int numVehicles,
			double lat, double lon, double vicinity, 
			double timeDuration, double timeStepLength) throws Exception {
		if(timeStepLength < 0 || timeDuration < 0) {
			throw new IllegalArgumentException("time units must be positive: " + timeStepLength + "," + timeDuration);
		}
		double numPoints = timeDuration / timeStepLength;
		if(numPoints > MAX_TRACE_POINTS) {
			throw new IllegalArgumentException("too many data points: " + numPoints);
		}

		TrafficTraces result = generateTraces(numVehicles, lat, lon, vicinity);
		for(TrafficTrace t : result.traces) {
			/* trim time */
			trimMaxTime(t.points, timeDuration);
			/* interpolate time */
			ValueInterpolation.interpolate(t.points, timeStepLength);
		}
		/* dump results */
		dumpVehiclePaths(result);
		return result;
	}

	public static void main(String[] args) throws Exception {

		/* Vienna */
		double lat = 48.2063, lon = 16.3710;
		double vicinity = 0.01;
		int numVehicles = 1;

		TrafficTraces traces = TrafficSimulatorMatsim.generateTraces(
				numVehicles, lat, lon, vicinity, 100, 1);
		System.out.println(traces.traces);
	}
}

