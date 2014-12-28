package io.riots.core.sim;

import io.riots.core.services.sim.Simulation;
import io.riots.core.services.sim.SimulationRun;
import io.riots.services.scenario.PropertyValue;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Class to manage currently running simulation instances.
 * @author whummer
 */
public class SimulationManager {

	private List<SimulationRunner> simulationRunners = new LinkedList<SimulationRunner>();
	/**
	 * Simulation runner thread pool.
	 * TODO: think about parallel execution, threadpooling etc.
	 */
	private ExecutorService executor = Executors.newCachedThreadPool();
	/**
	 * List of listeners.
	 */
	private static final Map<String,List<SimulationSubscription>> subscriptions = new HashMap<>();

	public static class SimulationSubscription {
		String subscriptionID;
		String simulationRunID;
		SimulationListener listener;
		public SimulationSubscription(String simulationRunID,
				SimulationListener simulationListener) {
			this.simulationRunID = simulationRunID;
			this.listener = simulationListener;
		}
	}

	private static class SimulationRunner implements Runnable {
		SimulationRun run;
		public SimulationRunner(SimulationRun run) {
			this.run = run;
		}
		public void run() {
			// TODO!
			while(true) {
				PropertyValue p = new PropertyValue(Math.random() * 2);
				p.setPropertyName("p1");
				synchronized (subscriptions) {
					System.out.println("notify " + p);
					if(!subscriptions.containsKey(run.getId())) {
						subscriptions.put(run.getId(), new LinkedList<>());
					}
					for(SimulationSubscription l : subscriptions.get(run.getId())) {
						l.listener.updateValue(run, p);
					}
				}
				try {
					Thread.sleep(1000);
				} catch (InterruptedException e) {}
			}
			// TODO
		}
	}

	public SimulationRun startSimulation(Simulation sim) {
		SimulationRun r = new SimulationRun(sim);
		r.setId(UUID.randomUUID().toString());
		r.setId("1"); // TODO remove!
		SimulationRunner runner = new SimulationRunner(r);
		simulationRunners.add(runner);
		executor.submit(runner);
		System.out.println("SimulationRun " + r.getId());
		return r;
	}

	public static SimulationSubscription registerListener(String simulationRunID, 
			SimulationListener simulationListener) {
		SimulationSubscription s = new SimulationSubscription(
				simulationRunID, simulationListener);
		s.simulationRunID = simulationRunID;
		s.subscriptionID = UUID.randomUUID().toString();
		synchronized (subscriptions) {
			if(!subscriptions.containsKey(simulationRunID)) {
				subscriptions.put(simulationRunID, new LinkedList<>());
			}
			subscriptions.get(simulationRunID).add(s);
		}
		return s;
	}

	public static void unregisterListener(String simulationRunID,
			SimulationSubscription simulationSubscription) {
		synchronized (subscriptions) {
			if(!subscriptions.containsKey(simulationRunID)) {
				return;
			}
			subscriptions.get(simulationRunID).remove(simulationSubscription);
		}
	}

}
